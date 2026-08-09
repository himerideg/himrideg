import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

/*
|--------------------------------------------------------------------------
| PaymentModal
| Ride complete hone ke baad customer ko yeh modal dikhega
|
| Props:
|   booking  - booking object (bookingId, finalFare required)
|   onSuccess - payment complete hone ke baad callback
|   onClose  - modal close callback
|--------------------------------------------------------------------------
*/

function PaymentModal({ booking, onSuccess, onClose }) {
  const [step, setStep] = useState("choose"); // "choose" | "processing" | "success" | "error"
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const bookingId =
    booking?._id || booking?.id || booking?.bookingId;

  const finalFare = Number(
    booking?.finalFare ||
    booking?.driverOfferedFare ||
    booking?.fare?.totalFare ||
    booking?.estimatedFare ||
    0
  );

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);

  /*
  |--------------------------------------------------------------------------
  | Razorpay Script Load karo
  |--------------------------------------------------------------------------
  */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /*
  |--------------------------------------------------------------------------
  | Online Payment — Razorpay
  |--------------------------------------------------------------------------
  */
  const handleOnlinePayment = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay load nahi hua. Internet check karo.");
      }

      // Backend se order create karo
      const { data } = await api.post("/payments/create-order", { bookingId });

      if (!data.success) {
        throw new Error(data.message || "Order create nahi hua");
      }

      const {
        keyId,
        orderId,
        amount,
        currency,
        customerName,
        customerPhone
      } = data.data;

      setStep("processing");

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "HimRideG",
        description: `Ride Payment - ${bookingId?.toString().slice(-8).toUpperCase()}`,
        image: "/himrideg-logo.png",
        prefill: {
          name: customerName || "",
          contact: customerPhone || ""
        },
        theme: {
          color: "#fbbf24"
        },
        modal: {
          ondismiss: () => {
            setStep("choose");
            setLoading(false);
          }
        },
        handler: async (response) => {
          try {
            // Signature verify karo
            const verifyRes = await api.post("/payments/verify", {
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              setStep("success");
              setReceipt(verifyRes.data.data);
              onSuccess?.({
                paymentMethod: "online",
                paymentId: response.razorpay_payment_id,
                ...verifyRes.data.data
              });
            } else {
              throw new Error(verifyRes.data.message || "Payment verify nahi hui");
            }
          } catch (err) {
            setError(err.message || "Payment verify karne mein error");
            setStep("error");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Payment fail ho gayi. Dobara try karo."
        );
        setStep("error");
      });
      razorpay.open();

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment start nahi ho saka");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, [bookingId, onSuccess]);

  /*
  |--------------------------------------------------------------------------
  | Cash Payment
  |--------------------------------------------------------------------------
  */
  const handleCashPayment = useCallback(async () => {
    setLoading(true);
    setError("");
    setStep("processing");

    try {
      // Cash ke case mein driver confirm karega
      // Customer sirf select karta hai
      setStep("success");
      setReceipt({
        paymentMethod: "cash",
        finalFare,
        message: "Driver ko cash dijiye. Driver confirm karega."
      });
      onSuccess?.({
        paymentMethod: "cash",
        finalFare
      });
    } catch (err) {
      setError(err.message || "Cash payment select nahi ho saka");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, [finalFare, onSuccess]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="paymentModalOverlay" onClick={(e) => {
      if (e.target === e.currentTarget && step !== "processing") onClose?.();
    }}>
      <div className="paymentModal">

        {/* Header */}
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">🚖</div>
          <h2>Ride Payment</h2>
          {step !== "processing" && step !== "success" && (
            <button
              className="paymentModalClose"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Fare Display */}
        <div className="paymentFareBox">
          <span>Total Fare</span>
          <strong>{formatMoney(finalFare)}</strong>
        </div>

        {/* Step: Choose Payment Method */}
        {step === "choose" && (
          <div className="paymentChoose">
            <p className="paymentChooseLabel">Payment method chuniye:</p>

            <div className="paymentMethods">
              {/* Online */}
              <button
                className={`paymentMethodCard ${paymentMethod === "online" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("online")}
              >
                <div className="paymentMethodIcon">💳</div>
                <div className="paymentMethodInfo">
                  <strong>Online Payment</strong>
                  <small>UPI, Card, Net Banking</small>
                </div>
                <div className="paymentMethodCheck">
                  {paymentMethod === "online" ? "✅" : "○"}
                </div>
              </button>

              {/* Cash */}
              <button
                className={`paymentMethodCard ${paymentMethod === "cash" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                <div className="paymentMethodIcon">💵</div>
                <div className="paymentMethodInfo">
                  <strong>Cash Payment</strong>
                  <small>Driver ko seedha cash dijiye</small>
                </div>
                <div className="paymentMethodCheck">
                  {paymentMethod === "cash" ? "✅" : "○"}
                </div>
              </button>
            </div>

            {error && (
              <div className="paymentError">⚠️ {error}</div>
            )}

            <button
              className="paymentConfirmBtn"
              disabled={!paymentMethod || loading}
              onClick={() => {
                if (paymentMethod === "online") handleOnlinePayment();
                else if (paymentMethod === "cash") handleCashPayment();
              }}
            >
              {loading ? "Processing..." : `Pay ${formatMoney(finalFare)}`}
            </button>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="paymentProcessing">
            <div className="paymentSpinner">⏳</div>
            <p>Payment process ho raha hai...</p>
            <small>Window band mat karo</small>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="paymentSuccess">
            <div className="paymentSuccessIcon">
              {receipt?.paymentMethod === "cash" ? "💵" : "✅"}
            </div>
            <h3>
              {receipt?.paymentMethod === "cash"
                ? "Cash Payment Selected"
                : "Payment Successful! 🎉"}
            </h3>

            {receipt?.paymentMethod === "cash" ? (
              <div className="paymentCashInstructions">
                <div className="cashInstRow">
                  <span>💰</span>
                  <p>Driver ko <strong>{formatMoney(finalFare)}</strong> cash dijiye</p>
                </div>
                <div className="cashInstRow">
                  <span>✅</span>
                  <p>Driver payment confirm karega</p>
                </div>
              </div>
            ) : (
              <div className="paymentReceiptBox">
                <div className="receiptRow">
                  <span>Amount Paid</span>
                  <strong>{formatMoney(receipt?.fare || finalFare)}</strong>
                </div>
                <div className="receiptRow">
                  <span>Method</span>
                  <strong>Online (Razorpay)</strong>
                </div>
                {receipt?.paymentId && (
                  <div className="receiptRow">
                    <span>Payment ID</span>
                    <strong className="paymentId">{receipt.paymentId}</strong>
                  </div>
                )}
              </div>
            )}

            <button className="paymentDoneBtn" onClick={onClose}>
              Done ✓
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="paymentErrorState">
            <div className="paymentErrorIcon">❌</div>
            <h3>Payment Failed</h3>
            <p>{error || "Kuch galat ho gaya. Dobara try karo."}</p>
            <div className="paymentErrorActions">
              <button
                className="paymentRetryBtn"
                onClick={() => { setStep("choose"); setError(""); }}
              >
                Dobara Try Karo
              </button>
              <button className="paymentCancelBtn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentModal;
