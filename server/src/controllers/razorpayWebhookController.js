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

/*
|--------------------------------------------------------------------------
| Phase 4 — Durable Razorpay Webhook ACK + Distributed Retry Queue
|--------------------------------------------------------------------------
|
| IMPORTANT ADD-ONLY SAFETY:
| - Existing signature verification and payment/payout processors above stay.
| - New handler persists a verified webhook BEFORE returning HTTP 200.
| - Redis queue ready ho to durable Mongo audit ID background worker ko jata hai.
| - Redis unavailable ho to same request synchronous processing fallback use
|   karta hai; failure par 500 return hota hai so Razorpay can retry.
| - Duplicate webhook event ID remains idempotent through Mongo unique index.
|
*/

const scalability = require("../config/scalability");

const {
  enqueueBackgroundJob,
  registerBackgroundJobHandler
} = require("../services/backgroundJobService");

const DURABLE_RAZORPAY_WEBHOOK_JOB =
  "razorpay:durable-webhook";

function durableEventEntity(kind, event) {
  if (kind === "payment") {
    const payment =
      event?.payload?.payment?.entity || null;

    return String(
      payment?.id ||
        payment?.order_id ||
        ""
    );
  }

  const payout =
    event?.payload?.payout?.entity || null;

  return String(
    payout?.id || ""
  );
}

async function claimDurableEvent({
  kind,
  eventId,
  event
}) {
  const eventType =
    String(event?.event || "");

  const entityId =
    durableEventEntity(
      kind,
      event
    );

  try {
    const doc =
      await RazorpayWebhookEvent.create({
        kind,
        eventId,
        eventType,
        entityId,
        status: "processing",
        payload: event,
        receivedAt: new Date()
      });

    return {
      doc,
      created: true
    };
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const existing =
      await RazorpayWebhookEvent.findOne({
        kind,
        eventId
      }).select("+payload");

    if (!existing) {
      throw error;
    }

    if (
      existing.status === "error" &&
      Number(existing.attemptCount || 0) <
        scalability.webhooks.retryMaxAttempts
    ) {
      existing.payload =
        existing.payload || event;
      existing.errorMessage = "";
      existing.processedAt = null;
      await existing.save();
    }

    return {
      doc: existing,
      created: false
    };
  }
}

async function finishClaimedDurableEvent(
  doc,
  status,
  errorMessage = ""
) {
  if (!doc) {
    return;
  }

  await RazorpayWebhookEvent.findByIdAndUpdate(
    doc._id,
    {
      $set: {
        status,
        errorMessage: String(
          errorMessage || ""
        ).slice(0, 1500),
        processedAt: new Date()
      }
    }
  );
}

async function processClaimedPaymentEvent(
  audit,
  event
) {
  const type =
    String(event?.event || "");

  const payment =
    event?.payload?.payment?.entity || null;

  if (type === "payment.captured") {
    const orderId =
      String(payment?.order_id || "");

    const booking = orderId
      ? await Booking.findOne({
          razorpayOrderId: orderId
        })
      : null;

    if (!booking) {
      await finishClaimedDurableEvent(
        audit,
        "ignored",
        "Booking order ID se nahi mili"
      );
      return;
    }

    await applyCapturedPayment(
      booking,
      payment
    );

    await finishClaimedDurableEvent(
      audit,
      "processed"
    );
    return;
  }

  if (type === "payment.failed") {
    const orderId =
      String(payment?.order_id || "");

    const booking = orderId
      ? await Booking.findOne({
          razorpayOrderId: orderId
        })
      : null;

    if (
      booking &&
      booking.paymentStatus !== "paid"
    ) {
      booking.paymentStatus = "failed";
      booking.paymentFailedAt = new Date();
      booking.paymentFailureReason = String(
        payment?.error_description ||
          payment?.error_reason ||
          payment?.error_code ||
          "Razorpay payment failed"
      ).slice(0, 500);

      if (!booking.payment) {
        booking.payment = {};
      }

      booking.payment.status = "failed";
      booking.payment.method = "online";
      booking.payment.gateway = "razorpay";

      await booking.save();
    }

    await finishClaimedDurableEvent(
      audit,
      booking ? "processed" : "ignored"
    );
    return;
  }

  await finishClaimedDurableEvent(
    audit,
    "ignored"
  );
}

async function processClaimedPayoutEvent(
  audit,
  event
) {
  const type =
    String(event?.event || "");

  const payout =
    event?.payload?.payout?.entity || null;

  if (
    !type.startsWith("payout.") ||
    !payout?.id
  ) {
    await finishClaimedDurableEvent(
      audit,
      "ignored"
    );
    return;
  }

  const updated =
    await walletService
      .finalizeWithdrawalByPayout(
        payout
      );

  await finishClaimedDurableEvent(
    audit,
    updated ? "processed" : "ignored",
    updated
      ? ""
      : "Matching withdrawal nahi mili"
  );
}

async function acquireDurableWebhookAttempt(
  kind,
  eventId
) {
  const current =
    await RazorpayWebhookEvent.findOne({
      kind,
      eventId
    }).select("+payload");

  if (!current) {
    return null;
  }

  if (
    ["processed", "ignored"].includes(
      current.status
    )
  ) {
    return null;
  }

  if (
    Number(current.attemptCount || 0) >=
    scalability.webhooks.retryMaxAttempts
  ) {
    return null;
  }

  /*
  | Duplicate gateway retries / duplicate Redis jobs must not process the
  | same payment concurrently. A recent processing attempt owns a short
  | lease; stale processing records become recoverable after 60 seconds.
  */
  const lastAttemptMs =
    current.lastAttemptAt
      ? new Date(
          current.lastAttemptAt
        ).getTime()
      : 0;

  const processingLeaseActive =
    current.status === "processing" &&
    Number(current.attemptCount || 0) > 0 &&
    lastAttemptMs > 0 &&
    Date.now() - lastAttemptMs < 60000;

  if (processingLeaseActive) {
    return null;
  }

  const claimed =
    await RazorpayWebhookEvent
      .findOneAndUpdate(
        {
          _id: current._id,
          status: current.status,
          attemptCount:
            Number(current.attemptCount || 0)
        },
        {
          $set: {
            status: "processing",
            errorMessage: "",
            lastAttemptAt: new Date()
          },
          $inc: {
            attemptCount: 1
          }
        },
        {
          new: true
        }
      )
      .select("+payload");

  return claimed || null;
}

async function processDurableRazorpayWebhookJob(
  payload
) {
  const kind =
    String(payload?.kind || "");

  const eventId =
    String(payload?.eventId || "");

  if (
    !["payment", "payout"].includes(kind) ||
    !eventId
  ) {
    throw new Error(
      "Invalid durable Razorpay webhook job"
    );
  }

  const audit =
    await acquireDurableWebhookAttempt(
      kind,
      eventId
    );

  if (!audit) {
    return;
  }

  const event = audit.payload;

  if (!event) {
    await finishClaimedDurableEvent(
      audit,
      "error",
      "Durable webhook payload missing"
    );

    throw new Error(
      "Durable webhook payload missing"
    );
  }

  try {
    if (kind === "payment") {
      await processClaimedPaymentEvent(
        audit,
        event
      );
      return;
    }

    await processClaimedPayoutEvent(
      audit,
      event
    );
  } catch (error) {
    await finishClaimedDurableEvent(
      audit,
      "error",
      error?.message || error
    );

    throw error;
  }
}

registerBackgroundJobHandler(
  DURABLE_RAZORPAY_WEBHOOK_JOB,
  processDurableRazorpayWebhookJob
);

function durableWebhookHandler({
  kind,
  secretEnv,
  legacyProcessor
}) {
  return async (req, res) => {
    const secret =
      String(
        process.env[secretEnv] || ""
      ).trim();

    if (!secret) {
      return res
        .status(503)
        .send(
          `${secretEnv} configure nahi hai`
        );
    }

    const rawBody = req.body;
    const signature =
      req.headers[
        "x-razorpay-signature"
      ];

    if (
      !verifyWebhookSignature(
        rawBody,
        signature,
        secret
      )
    ) {
      return res
        .status(400)
        .send(
          "Invalid Razorpay webhook signature"
        );
    }

    let event;

    try {
      event = JSON.parse(
        rawBody.toString("utf8")
      );
    } catch {
      return res
        .status(400)
        .send("Invalid JSON");
    }

    const eventId =
      eventIdFrom(
        req,
        rawBody
      );

    if (
      !scalability.webhooks
        .durableAckEnabled
    ) {
      res.status(200).send("ok");

      setImmediate(() => {
        legacyProcessor({
          event,
          eventId,
          kind
        }).catch((error) => {
          console.error(
            `[Razorpay ${kind} webhook legacy async]`,
            error.message
          );
        });
      });

      return;
    }

    try {
      const claim =
        await claimDurableEvent({
          kind,
          eventId,
          event
        });

      if (
        ["processed", "ignored"].includes(
          claim.doc.status
        )
      ) {
        return res
          .status(200)
          .send("ok");
      }

      let queued = false;

      if (
        scalability.webhooks
          .backgroundQueueEnabled
      ) {
        try {
          const queueResult =
            await enqueueBackgroundJob(
              DURABLE_RAZORPAY_WEBHOOK_JOB,
              {
                kind,
                eventId
              },
              {
                id:
                  `razorpay:${kind}:${eventId}`,
                maxAttempts:
                  scalability.webhooks
                    .retryMaxAttempts
              }
            );

          queued = Boolean(
            queueResult?.queued
          );

          if (queued) {
            await RazorpayWebhookEvent
              .findByIdAndUpdate(
                claim.doc._id,
                {
                  $set: {
                    queuedAt:
                      new Date()
                  }
                }
              );
          }
        } catch (queueError) {
          console.error(
            `[Razorpay ${kind} webhook queue fallback]`,
            queueError?.message ||
              queueError
          );
        }
      }

      if (queued) {
        return res
          .status(200)
          .send("ok");
      }

      /* Redis queue unavailable: process before ACK so gateway retry remains. */
      await processDurableRazorpayWebhookJob({
        kind,
        eventId
      });

      return res
        .status(200)
        .send("ok");
    } catch (error) {
      console.error(
        `[Razorpay ${kind} durable webhook]`,
        error?.message || error
      );

      return res
        .status(500)
        .send(
          "Webhook safely process nahi hua; retry required"
        );
    }
  };
}

/* Later exports intentionally override only the route handlers, not old code. */
exports.paymentWebhook = durableWebhookHandler({
  kind: "payment",
  secretEnv: "RAZORPAY_WEBHOOK_SECRET",
  legacyProcessor: processPaymentEvent
});

exports.payoutWebhook = durableWebhookHandler({
  kind: "payout",
  secretEnv: "RAZORPAYX_WEBHOOK_SECRET",
  legacyProcessor: processPayoutEvent
});

exports.processDurableRazorpayWebhookJob =
  processDurableRazorpayWebhookJob;

/*
|--------------------------------------------------------------------------
| Phase 4 Startup Recovery
|--------------------------------------------------------------------------
| Free Redis has no persistence. Mongo webhook audit therefore remains the
| source of truth. Server restart par unfinished verified events re-queued
| (or safe direct fallback) hote hain.
*/
async function recoverPendingDurableRazorpayWebhooks() {
  if (
    !scalability.webhooks
      .durableAckEnabled
  ) {
    return {
      enabled: false,
      scanned: 0,
      queued: 0,
      directProcessed: 0
    };
  }

  const pending =
    await RazorpayWebhookEvent
      .find({
        status: {
          $in: [
            "processing",
            "error"
          ]
        },
        attemptCount: {
          $lt:
            scalability.webhooks
              .retryMaxAttempts
        }
      })
      .sort({ createdAt: 1 })
      .limit(500)
      .select(
        "kind eventId status attemptCount"
      )
      .lean();

  let queued = 0;
  let directProcessed = 0;

  for (const item of pending) {
    let result = null;

    if (
      scalability.webhooks
        .backgroundQueueEnabled
    ) {
      try {
        result =
          await enqueueBackgroundJob(
            DURABLE_RAZORPAY_WEBHOOK_JOB,
            {
              kind: item.kind,
              eventId: item.eventId
            },
            {
              id:
                `razorpay-recovery:${item.kind}:${item.eventId}`,
              maxAttempts:
                scalability.webhooks
                  .retryMaxAttempts
            }
          );
      } catch (error) {
        console.error(
          "[Razorpay Webhook Recovery] queue error:",
          error?.message || error
        );
      }
    }

    if (result?.queued) {
      queued += 1;
      continue;
    }

    /* Direct recovery is deliberately capped to keep server boot bounded. */
    if (directProcessed >= 25) {
      continue;
    }

    try {
      await processDurableRazorpayWebhookJob({
        kind: item.kind,
        eventId: item.eventId
      });
      directProcessed += 1;
    } catch (error) {
      console.error(
        "[Razorpay Webhook Recovery] direct retry failed:",
        error?.message || error
      );
    }
  }

  return {
    enabled: true,
    scanned: pending.length,
    queued,
    directProcessed
  };
}

exports.recoverPendingDurableRazorpayWebhooks =
  recoverPendingDurableRazorpayWebhooks;
