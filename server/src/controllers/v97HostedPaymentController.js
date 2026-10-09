/*
|--------------------------------------------------------------------------
| V97 Hosted (browser) Razorpay checkout + order sync
|--------------------------------------------------------------------------
|
| Why: UPI apps (GPay / PhonePe / Paytm) flag UPI intents fired from an
| in-app WebView as "risky" and decline them. Razorpay checkout opened in
| the phone's real browser (Chrome) uses Razorpay's standard mobile-web
| UPI flow, which UPI apps accept.
|
| - GET  /api/v2/payments/v97/hosted/:orderId        -> checkout page
| - GET  /api/v2/payments/v97/hosted/:orderId/done   -> sync + "return to app"
| - POST /api/v2/payments/v97/sync  (auth)           -> app checks status
|
| The order itself is created by the existing /payments/create-order
| (authenticated). The order id is random and only lets someone PAY the
| locked fare, so the page needs no login. Paid status is never trusted
| from the browser: it is always read back from Razorpay on the server.
*/

const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");
const { applyCapturedPayment } = require("./paymentController");
const { sendPushToUser } = require("../services/pushNotificationService");

const ORDER_RE = /^order_[A-Za-z0-9]{6,40}$/;

const fareOf = (booking) =>
  Number(booking?.finalFare ?? booking?.fare?.finalFare ?? 0) || 0;

const idOf = (value) => String(value?._id || value || "");

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setPageHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' https://*.razorpay.com",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://*.razorpay.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.razorpay.com https://*.razorpay.in",
      "frame-src https://*.razorpay.com https://*.razorpay.in",
      "form-action 'self' https://*.razorpay.com",
      "base-uri 'none'"
    ].join("; ")
  );
}

function shell(title, inner) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#070809"><title>${esc(title)}</title>
<style>
html,body{margin:0;background:#070809;color:#fff;font-family:Arial,Helvetica,sans-serif}
.w{max-width:440px;margin:0 auto;padding:28px 18px;text-align:center}
.b{font-weight:900;font-size:26px;color:#F5C518;margin-bottom:6px}
.f{font-size:44px;font-weight:900;margin:18px 0 6px}
.m{color:#c9cdd3;font-size:15px;line-height:1.5}
.btn{display:block;width:100%;box-sizing:border-box;margin-top:16px;padding:16px;border-radius:14px;border:0;
background:#F5C518;color:#070809;font-weight:900;font-size:17px;text-decoration:none;cursor:pointer}
.o{background:transparent;color:#fff;border:1px solid #3a3d42}
.ok{color:#3ddc84}.er{color:#ff6b6b}
</style></head><body><div class="w"><div class="b">HimRideG</div>${inner}</div></body></html>`;
}

async function findCapturedPayment(orderId, expectedPaise) {
  const list = await razorpay.orders.fetchPayments(orderId);
  const items = Array.isArray(list?.items) ? list.items : [];

  let captured = items.find(
    (p) => String(p?.status || "").toLowerCase() === "captured"
  );
  if (captured) return captured;

  const authorized = items.find(
    (p) => String(p?.status || "").toLowerCase() === "authorized"
  );
  if (authorized && Number(authorized.amount) === expectedPaise) {
    try {
      captured = await razorpay.payments.capture(authorized.id, expectedPaise, "INR");
    } catch (captureError) {
      captured = await razorpay.payments.fetch(authorized.id);
    }
    if (String(captured?.status || "").toLowerCase() === "captured") return captured;
  }
  return null;
}

function notifyPaid(req, booking) {
  const fare = fareOf(booking);
  const driverId = idOf(booking.driver);
  const customerId = idOf(booking.customer);
  const payload = {
    bookingId: String(booking._id),
    fare,
    amount: fare,
    paymentMethod: "online",
    paymentStatus: "paid",
    paymentId: booking.razorpayPaymentId,
    paidAt: booking.paidAt
  };

  try {
    const io = req.app.get("io");
    if (io && driverId) {
      io.to(`driver:${driverId}`).emit("payment:success", payload);
      io.to(`driver:${driverId}`).emit("payment:completed", payload);
    }
    if (io && customerId) {
      io.to(`user:${customerId}`).emit("payment:completed", payload);
    }
  } catch (_) {}

  const pushData = {
    type: "payment_success",
    bookingId: String(booking._id),
    paymentMethod: "online",
    paymentStatus: "paid",
    fare
  };
  if (customerId) {
    sendPushToUser(customerId, {
      title: "Payment Successful ✅",
      body: `₹${fare} online payment successful ho gayi.`,
      data: { ...pushData, soundEvent: "online_payment_success", role: "customer" }
    }).catch(() => {});
  }
  if (driverId) {
    sendPushToUser(driverId, {
      title: `Payment Received ₹${fare}`,
      body: "Customer ki online payment successfully receive ho gayi.",
      data: { ...pushData, soundEvent: "payment_received_driver", role: "driver" }
    }).catch(() => {});
  }
}

/** Reads Razorpay for this order and marks the booking paid if captured. */
async function syncOrder(req, booking) {
  if (!booking?.razorpayOrderId) return { paid: booking?.paymentStatus === "paid", booking };
  if (booking.paymentStatus === "paid") return { paid: true, booking };

  const expectedPaise = Math.round(fareOf(booking) * 100);
  const payment = await findCapturedPayment(booking.razorpayOrderId, expectedPaise);
  if (!payment) return { paid: false, booking };

  const wasPaid = booking.paymentStatus === "paid";
  const updated = await applyCapturedPayment(booking, payment);
  if (!wasPaid && updated?.paymentStatus === "paid") notifyPaid(req, updated);
  return { paid: updated?.paymentStatus === "paid", booking: updated };
}

exports.hostedCheckoutPage = async (req, res) => {
  setPageHeaders(res);
  try {
    const orderId = String(req.params.orderId || "");
    if (!ORDER_RE.test(orderId)) {
      return res.status(400).send(shell("Payment", `<p class="m er">Invalid payment link.</p>`));
    }

    const booking = await Booking.findOne({ razorpayOrderId: orderId }).populate("customer", "name phone email");
    if (!booking) {
      return res.status(404).send(shell("Payment", `<p class="m er">This payment link has expired. Open the HimRideG app and tap Pay Online again.</p>`));
    }

    const fare = fareOf(booking);
    const doneUrl = `${req.baseUrl}/v97/hosted/${encodeURIComponent(orderId)}/done`;

    if (booking.paymentStatus === "paid") {
      return res.redirect(302, doneUrl);
    }

    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: Math.round(fare * 100),
      currency: "INR",
      name: "HimRideG",
      description: `Ride payment ${booking.bookingNumber || ""}`.trim(),
      order_id: orderId,
      prefill: {
        name: booking.customer?.name || "",
        contact: booking.customer?.phone || "",
        email: booking.customer?.email || ""
      },
      theme: { color: "#F5C518", backdrop_color: "#070809" },
      retry: { enabled: true }
    };

    const inner = `
<div class="m">Ride payment</div>
<div class="f">₹${esc(fare)}</div>
<p class="m">Pay with any UPI app, card or netbanking. After paying, return to the HimRideG app.</p>
<button class="btn" id="pay">Pay ₹${esc(fare)}</button>
<a class="btn o" href="${esc(doneUrl)}">I have paid — check status</a>
<p class="m" id="msg"></p>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
(function(){
  var opts = ${JSON.stringify(options).replace(/</g, "\\u003c")};
  var done = ${JSON.stringify(doneUrl)};
  opts.handler = function(){ window.location.href = done; };
  opts.modal = { ondismiss: function(){ document.getElementById("msg").textContent = "Payment window closed. Tap Pay to try again."; } };
  function open(){
    try {
      var rzp = new Razorpay(opts);
      rzp.on("payment.failed", function(r){
        document.getElementById("msg").textContent =
          (r && r.error && r.error.description) ? r.error.description : "Payment failed. Try another UPI app or method.";
      });
      rzp.open();
    } catch (e) {
      document.getElementById("msg").textContent = "Checkout could not open. Check internet and tap Pay.";
    }
  }
  document.getElementById("pay").addEventListener("click", open);
  if (window.Razorpay) open(); else window.addEventListener("load", open);
})();
</script>`;

    return res.status(200).send(shell("HimRideG Payment", inner));
  } catch (error) {
    console.error("[V97] hosted checkout page failed:", error?.message || error);
    return res.status(500).send(shell("Payment", `<p class="m er">Payment page could not load. Try again from the app.</p>`));
  }
};

exports.hostedDonePage = async (req, res) => {
  setPageHeaders(res);
  try {
    const orderId = String(req.params.orderId || "");
    if (!ORDER_RE.test(orderId)) {
      return res.status(400).send(shell("Payment", `<p class="m er">Invalid payment link.</p>`));
    }
    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (!booking) {
      return res.status(404).send(shell("Payment", `<p class="m er">Payment not found.</p>`));
    }

    let result = { paid: booking.paymentStatus === "paid" };
    try {
      result = await syncOrder(req, booking);
    } catch (syncError) {
      console.warn("[V97] hosted done sync:", syncError?.message || syncError);
    }

    const appLink = `himrideg://payment?bookingId=${encodeURIComponent(String(booking._id))}`;
    const retryUrl = `${req.baseUrl}/v97/hosted/${encodeURIComponent(orderId)}`;

    const inner = result.paid
      ? `<div class="f ok">✅</div><p class="m ok"><b>Payment successful — ₹${esc(fareOf(booking))}</b></p>
<p class="m">You can go back to the HimRideG app now.</p>
<a class="btn" href="${esc(appLink)}">Return to HimRideG app</a>`
      : `<div class="f">⏳</div><p class="m">Payment not received yet. If money was debited, wait a minute and check again.</p>
<a class="btn" href="${esc(req.originalUrl)}">Check again</a>
<a class="btn o" href="${esc(retryUrl)}">Try payment again</a>
<a class="btn o" href="${esc(appLink)}">Return to HimRideG app</a>`;

    return res.status(200).send(shell("HimRideG Payment", inner));
  } catch (error) {
    console.error("[V97] hosted done page failed:", error?.message || error);
    return res.status(500).send(shell("Payment", `<p class="m er">Could not check payment. Open the app to see status.</p>`));
  }
};

exports.syncOnlinePayment = async (req, res) => {
  try {
    const bookingId = String(req.body?.bookingId || req.params?.bookingId || "");
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID required hai" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });

    const userId = String(req.user?._id || "");
    const role = String(req.user?.role || "");
    if (role !== "admin" && userId !== idOf(booking.customer) && userId !== idOf(booking.driver)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await syncOrder(req, booking);
    return res.status(200).json({
      success: true,
      data: {
        bookingId: String(booking._id),
        paid: Boolean(result.paid),
        paymentStatus: result.booking?.paymentStatus || booking.paymentStatus,
        paymentMethod: result.booking?.paymentMethod || booking.paymentMethod,
        paymentId: result.booking?.razorpayPaymentId || ""
      }
    });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({
      success: false,
      message: error?.error?.description || error?.message || "Payment status check nahi ho saka"
    });
  }
};
