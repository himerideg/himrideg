const crypto = require("node:crypto");
const Booking = require("../models/Booking");
const RazorpayWebhookEvent = require("../models/RazorpayWebhookEvent");
const walletService = require("../services/walletService");
const { applyCapturedPayment } = require("./paymentController");

function verifyWebhookSignature(rawBody, receivedSignature, secret) {
  if (!Buffer.isBuffer(rawBody)) return false;
  if (!receivedSignature || !secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(String(receivedSignature), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    received.length === expectedBuffer.length &&
    crypto.timingSafeEqual(received, expectedBuffer)
  );
}

function eventIdFrom(req, rawBody) {
  return String(
    req.headers["x-razorpay-event-id"] ||
      crypto.createHash("sha256").update(rawBody).digest("hex")
  ).slice(0, 200);
}

async function claimEvent({ kind, eventId, eventType, entityId }) {
  try {
    const doc = await RazorpayWebhookEvent.create({
      kind,
      eventId,
      eventType,
      entityId: entityId || "",
      status: "processing"
    });
    return doc;
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
}

async function finishEvent(doc, status, errorMessage = "") {
  if (!doc) return;
  await RazorpayWebhookEvent.findByIdAndUpdate(doc._id, {
    $set: {
      status,
      errorMessage: String(errorMessage || "").slice(0, 1500),
      processedAt: new Date()
    }
  });
}

async function processPaymentEvent({ event, eventId }) {
  const type = String(event?.event || "");
  const payment = event?.payload?.payment?.entity || null;
  const entityId = String(payment?.id || payment?.order_id || "");
  const audit = await claimEvent({
    kind: "payment",
    eventId,
    eventType: type,
    entityId
  });
  if (!audit) return;

  try {
    if (type === "payment.captured") {
      const orderId = String(payment?.order_id || "");
      const booking = orderId
        ? await Booking.findOne({ razorpayOrderId: orderId })
        : null;

      if (!booking) {
        await finishEvent(audit, "ignored", "Booking order ID se nahi mili");
        return;
      }

      await applyCapturedPayment(booking, payment);
      await finishEvent(audit, "processed");
      return;
    }

    if (type === "payment.failed") {
      const orderId = String(payment?.order_id || "");
      const booking = orderId
        ? await Booking.findOne({ razorpayOrderId: orderId })
        : null;

      if (booking && booking.paymentStatus !== "paid") {
        booking.paymentStatus = "failed";
        booking.paymentFailedAt = new Date();
        booking.paymentFailureReason = String(
          payment?.error_description ||
            payment?.error_reason ||
            payment?.error_code ||
            "Razorpay payment failed"
        ).slice(0, 500);
        if (!booking.payment) booking.payment = {};
        booking.payment.status = "failed";
        booking.payment.method = "online";
        booking.payment.gateway = "razorpay";
        await booking.save();
      }

      await finishEvent(audit, booking ? "processed" : "ignored");
      return;
    }

    await finishEvent(audit, "ignored");
  } catch (error) {
    console.error(`[Razorpay Payment Webhook] ${type}:`, error.message);
    await finishEvent(audit, "error", error.message);
  }
}

async function processPayoutEvent({ event, eventId }) {
  const type = String(event?.event || "");
  const payout = event?.payload?.payout?.entity || null;
  const entityId = String(payout?.id || "");
  const audit = await claimEvent({
    kind: "payout",
    eventId,
    eventType: type,
    entityId
  });
  if (!audit) return;

  try {
    if (!type.startsWith("payout.") || !payout?.id) {
      await finishEvent(audit, "ignored");
      return;
    }

    const updated = await walletService.finalizeWithdrawalByPayout(payout);
    await finishEvent(
      audit,
      updated ? "processed" : "ignored",
      updated ? "" : "Matching withdrawal nahi mili"
    );
  } catch (error) {
    console.error(`[RazorpayX Payout Webhook] ${type}:`, error.message);
    await finishEvent(audit, "error", error.message);
  }
}

function webhookHandler({ kind, secretEnv, processor }) {
  return (req, res) => {
    const secret = String(process.env[secretEnv] || "").trim();
    if (!secret) {
      return res.status(503).send(`${secretEnv} configure nahi hai`);
    }

    const rawBody = req.body;
    const signature = req.headers["x-razorpay-signature"];
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return res.status(400).send("Invalid Razorpay webhook signature");
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).send("Invalid JSON");
    }

    const eventId = eventIdFrom(req, rawBody);
    res.status(200).send("ok");

    setImmediate(() => {
      processor({ event, eventId, kind }).catch((error) => {
        console.error(`[Razorpay ${kind} webhook async]`, error.message);
      });
    });
  };
}

exports.paymentWebhook = webhookHandler({
  kind: "payment",
  secretEnv: "RAZORPAY_WEBHOOK_SECRET",
  processor: processPaymentEvent
});

exports.payoutWebhook = webhookHandler({
  kind: "payout",
  secretEnv: "RAZORPAYX_WEBHOOK_SECRET",
  processor: processPayoutEvent
});
