import React, { useEffect, useState } from "react";
import api from "../api";
import "../driver-v75-parity.css";
import "../driver-platform-fee-readable.css";

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
  const testMode = Boolean(status?.testMode);
  const blocked = testMode
    ? false
    : Boolean(status?.blocked ?? due >= threshold);

  const pay = async () => {
    if (testMode || due <= 0 || busy) return;
    setBusy(true);
    setError("");

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) throw new Error("Razorpay भुगतान विंडो लोड नहीं हुई");

      const orderResponse = await api.post("/driver/platform-fee/create-order", {});
      const order = orderResponse?.data?.data || orderResponse?.data || {};
      if (!order?.keyId || !order?.orderId || !Number(order?.amount)) {
        throw new Error(orderResponse?.data?.message || "प्लेटफॉर्म फीस का भुगतान तैयार नहीं हुआ");
      }

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "HimRideG",
          description: "HimRideG प्लेटफॉर्म फीस",
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
                throw new Error(verifyResponse?.data?.message || "प्लेटफॉर्म फीस सत्यापित नहीं हुई");
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
          reject(new Error(failure?.error?.description || "प्लेटफॉर्म फीस का भुगतान असफल रहा"));
        });
        checkout.open();
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "प्लेटफॉर्म फीस का भुगतान असफल रहा");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="v75Overlay" role="dialog" aria-modal="true" aria-label="HimRideG प्लेटफॉर्म फीस">
      <section className={`v75Prompt v76ReadablePrompt ${blocked ? "blocked" : ""} ${testMode ? "testMode" : ""}`}>
        <button type="button" className="v75Close" onClick={onClose} aria-label="बंद करें">×</button>
        <div className="v75Kicker">HIMRIDEG प्लेटफॉर्म फीस</div>

        <h2>
          {testMode
            ? "टेस्ट मोड चालू है"
            : blocked
              ? "नई Ride लेने के लिए प्लेटफॉर्म फीस जमा करें"
              : "बिना रुकावट नई Ride लेते रहें"}
        </h2>

        <p className="v76PromptHindiMessage">
          {testMode
            ? "यह परीक्षण खाता है। नई Ride लेने पर प्लेटफॉर्म फीस का लॉक लागू नहीं होगा। टेस्ट पूरा होने पर Admin से टेस्ट मोड बंद करें।"
            : blocked
              ? `आपकी बकाया प्लेटफॉर्म फीस ₹${money(due)} हो गई है। नई Ride आपको दिखाई देगी, लेकिन उसे स्वीकार करने से पहले प्लेटफॉर्म फीस जमा करनी होगी।`
              : `अभी ₹${money(due)} प्लेटफॉर्म फीस बाकी है। जब तक बकाया फीस ₹${money(threshold)} से कम है, आप नई Ride लेते रह सकते हैं।`}
        </p>

        <div className="v75FeeAmountRow">
          <div><small>अभी बकाया</small><strong>₹{money(due)}</strong></div>
          <span className="v75RulePill">
            {testMode ? "टेस्ट मोड" : blocked ? `₹${money(threshold)}+ रोक` : `< ₹${money(threshold)} चालू`}
          </span>
        </div>

        {error ? <p style={{ color: "#ef4444", fontWeight: 800 }}>{error}</p> : null}

        {!testMode ? (
          <button type="button" className="v75PrimaryButton v75PrimaryButtonLarge" onClick={pay} disabled={busy || due <= 0}>
            {busy ? "भुगतान खुल रहा है…" : `प्लेटफॉर्म फीस ₹${money(due)} जमा करें`}
          </button>
        ) : null}

        <button type="button" className="v75SecondaryButton" onClick={onClose}>
          {testMode ? "ठीक है" : blocked ? "अभी बंद करें" : "अभी नहीं • Ride जारी रखें"}
        </button>

        {blocked ? (
          <p className="v75BlockNote v76BlockNoteLarge">
            यह विंडो बंद की जा सकती है, लेकिन फीस ₹{money(threshold)} से कम होने तक नई Ride स्वीकार नहीं होगी।
          </p>
        ) : null}
      </section>
    </div>
  );
}
