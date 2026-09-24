import React, { useMemo, useState } from "react";
import api from "../api";
import "../driver-v75-parity.css";
import "../direct-driver-upi.css";

const idOf = (ride) => String(ride?._id || ride?.id || ride?.bookingId || "");
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export default function DirectDriverUpiPayment({ booking, onClaim }) {
  const bookingId = idOf(booking);
  const [details, setDetails] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const amount = useMemo(
    () => Number(details?.amount || booking?.finalFare || booking?.fare?.finalFare || 0) || 0,
    [details, booking]
  );

  const loadDetails = async () => {
    if (!bookingId || busy) return;
    setBusy("load");
    setError("");
    try {
      const response = await api.get(`/payments/${bookingId}/direct-driver`);
      const data = response?.data?.data || null;
      if (!response?.data?.success || !data?.upiId) {
        throw new Error(response?.data?.message || "Driver UPI available nahi hai");
      }
      setDetails(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Driver UPI load nahi hua");
    } finally {
      setBusy("");
    }
  };

  const openUpi = async () => {
    if (!details?.upiUrl) return;
    setError("");
    try {
      window.location.href = details.upiUrl;
    } catch {
      setError("UPI app open nahi hui. UPI ID copy karke manually payment karein.");
    }
  };

  const copyUpi = async () => {
    if (!details?.upiId) return;
    try {
      await navigator.clipboard.writeText(details.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(`UPI ID: ${details.upiId}`);
    }
  };

  const claimPaid = async () => {
    if (!bookingId || busy) return;
    setBusy("claim");
    setError("");
    try {
      const response = await api.post(`/payments/${bookingId}/direct-driver/claim`, {});
      const payload = response?.data?.data || {};
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Payment confirmation driver ko nahi bheji ja saki");
      }

      onClaim?.({
        status: "completed",
        paymentStatus: "pending",
        paymentMethod: "cash",
        paymentChoiceAfterRide: "cash",
        cashSelectedAt: payload?.claimedAt || new Date().toISOString(),
        payment: {
          ...(booking?.payment || {}),
          method: "cash",
          status: "pending",
          gateway: "driver_upi",
          transactionId: "DIRECT_UPI_PENDING"
        }
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Payment confirmation nahi bheji ja saki");
    } finally {
      setBusy("");
    }
  };

  if (!details) {
    return (
      <div className="v75DirectBox">
        <button
          type="button"
          className="v75PaymentDirectButton"
          disabled={Boolean(busy)}
          onClick={loadDetails}
        >
          {busy === "load" ? "Driver UPI loading…" : "Pay Driver Direct UPI"}
        </button>
        <small>RazorpayX approval tak fare seedha driver ke saved UPI par pay kar sakte hain.</small>
        {error ? <div className="paymentErrorBox v60PaymentError">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="v75DirectBox">
      <small>DIRECT DRIVER UPI</small>
      <strong>{details.driverName || "HimRideG Driver"} · {money(amount)}</strong>
      <div className="v75DirectUpiRow">
        <span>{details.maskedUpi || details.upiId}</span>
        <button type="button" onClick={copyUpi}>{copied ? "Copied ✓" : "Copy UPI"}</button>
      </div>
      <button type="button" className="v75PaymentDirectButton" onClick={openUpi}>
        Open UPI App · Pay {money(amount)}
      </button>
      <button
        type="button"
        className="v75PaymentClaimButton"
        disabled={Boolean(busy)}
        onClick={claimPaid}
      >
        {busy === "claim" ? "Driver ko bata rahe hain…" : `I Paid ${money(amount)} · Driver Verify Kare`}
      </button>
      <small>Sirf UPI app me payment successful hone ke baad “I Paid” dabayein. Payment tabhi final hogi jab driver apne account me amount check karke confirm karega.</small>
      {error ? <div className="paymentErrorBox v60PaymentError">{error}</div> : null}
    </div>
  );
}
