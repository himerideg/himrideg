import React, { useEffect, useState } from "react";
import api from "../api";
import "../driver-v75-parity.css";

const money = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0);

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function DriverPlatformFeePrompt({
  visible,
  status,
  onClose,
  onPaid
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) setError("");
  }, [visible]);

  if (!visible) return null;

  const due = Math.max(0, Number(status?.due || 0));
  const threshold = Math.max(1, Number(status?.threshold || 100));
  const blocked = Boolean(status?.blocked ?? due >= threshold);

  const pay = async () => {
    if (due <= 0 || busy) return;
    setBusy(true);
    setError("");

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) throw new Error("Razorpay checkout load nahi hua");

      const orderResponse = await api.post("/driver/platform-fee/create-order", {});
      const order = orderResponse?.data?.data || orderResponse?.data || {};
      if (!order?.keyId || !order?.orderId || !Number(order?.amount)) {
        throw new Error(orderResponse?.data?.message || "Platform fee order ready nahi hua");
      }

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "HimRideG",
          description: "Driver Platform Fee",
          order_id: order.orderId,
          prefill: {
            name: order.driverName || "HimRideG Driver",
            contact: order.driverPhone || ""
          },
          theme: { color: "#f5c518" },
          handler: async (response) => {
            try {
              const verifyResponse = await api.post("/driver/platform-fee/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              if (!verifyResponse?.data?.success) {
                throw new Error(verifyResponse?.data?.message || "Platform fee verify nahi hui");
              }
              await onPaid?.(verifyResponse?.data?.data || {});
              resolve();
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          modal: { ondismiss: () => resolve() }
        });
        checkout.on("payment.failed", (failure) => {
          reject(new Error(failure?.error?.description || "Platform fee payment failed"));
        });
        checkout.open();
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Platform fee payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="v75Overlay" role="dialog" aria-modal="true" aria-label="HimRideG platform fee">
      <section className={`v75Prompt ${blocked ? "blocked" : ""}`}>
        <button type="button" className="v75Close" onClick={onClose} aria-label="Close">×</button>
        <div className="v75Kicker">HIMRIDEG PLATFORM FEE</div>
        <h2>{blocked ? "नई राइड Accept करने से पहले फीस जमा करें" : "बिना रुकावट नई राइड लेते रहें"}</h2>
        <p>
          {blocked
            ? `आपकी बकाया प्लेटफॉर्म फीस ₹${money(due)} हो गई है। Ride request दिखेगी, लेकिन Accept करने के लिए पहले फीस जमा करें।`
            : `अभी ₹${money(due)} प्लेटफॉर्म फीस बाकी है। ₹${money(threshold)} से कम होने तक आप rides Accept करते रह सकते हैं।`}
        </p>
        <div className="v75FeeAmountRow">
          <div><small>अभी बकाया</small><strong>₹{money(due)}</strong></div>
          <span className="v75RulePill">{blocked ? `₹${money(threshold)}+ LOCK` : `< ₹${money(threshold)} ACTIVE`}</span>
        </div>
        {error ? <p style={{ color: "#ef4444", fontWeight: 800 }}>{error}</p> : null}
        <button type="button" className="v75PrimaryButton" onClick={pay} disabled={busy || due <= 0}>
          {busy ? "Opening Payment…" : `Pay Platform Fee ₹${money(due)}`}
        </button>
        <button type="button" className="v75SecondaryButton" onClick={onClose}>
          {blocked ? "अभी बंद करें" : "अभी नहीं • Ride जारी रखें"}
        </button>
        {blocked ? <p className="v75BlockNote">Cross popup बंद करेगा, लेकिन फीस कम होने तक Ride Accept unlock नहीं होगा।</p> : null}
      </section>
    </div>
  );
}
