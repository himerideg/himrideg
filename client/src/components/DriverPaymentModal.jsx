import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import { playHimRideGEventSound } from "../utils/himridegSounds";

/*
|--------------------------------------------------------------------------
| HimRideG V57 Driver Payment / Advance Modal
|--------------------------------------------------------------------------
| Backend state is authoritative. `payment_pending` ride remains attached to
| both customer and driver until driver confirms money received. This modal is
| therefore non-dismissible during payment_pending and reappears after login or
| refresh when dashboard hydrates bookings again.
|--------------------------------------------------------------------------
*/

const idOf = (ride) => String(ride?._id || ride?.id || ride?.bookingId || "");
const finalFareOf = (ride) => Number(ride?.finalFare ?? ride?.fare?.finalFare ?? 0) || 0;
const advancePaidOf = (ride) => Math.max(0, Number(ride?.advancePaidAmount || 0) || 0);
const paymentDueOf = (ride) => {
  const explicit = Number(ride?.paymentDueAmount);
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;
  return Math.max(0, finalFareOf(ride) - advancePaidOf(ride));
};
const paymentStatusOf = (ride) =>
  String(ride?.paymentStatus ?? ride?.payment?.status ?? "pending").toLowerCase();
const paymentMethodOf = (ride) =>
  String(ride?.paymentMethod ?? ride?.payment?.method ?? "").toLowerCase();
const cashSelectedOf = (ride) =>
  Boolean(
    ride?.cashSelectedAt ||
      ride?.payment?.cashSelectedAt ||
      String(ride?.paymentChoiceAfterRide || ride?.payment?.choiceAfterRide || "").toLowerCase() === "cash"
  );
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function DriverPaymentModal({ ride, onClose, onUpdate }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const soundRef = useRef("");

  const bookingId = idOf(ride);
  const status = String(ride?.status || "").toLowerCase();
  const fare = useMemo(() => finalFareOf(ride), [ride]);
  const advancePaid = advancePaidOf(ride);
  const due = paymentDueOf(ride);
  const paymentStatus = paymentStatusOf(ride);
  const paymentMethod = paymentMethodOf(ride);
  const cashSelected = cashSelectedOf(ride);
  const advanceStatus = String(ride?.advanceStatus || "none").toLowerCase();

  // FULL CODE RULE: keep the previous decision logic available for rollback/audit.
  // Launch mode intentionally gates these legacy branches off without deleting them.
  const legacyLocked = status === "payment_pending";
  const legacyCanRequestAdvance =
    ["fare_accepted", "driver_arriving", "driver_arrived"].includes(status) &&
    fare > 0 &&
    advancePaid <= 0 &&
    !["requested", "paid", "pay_later"].includes(advanceStatus);
  const legacyOnlineAwaitingConfirm =
    legacyLocked && paymentStatus === "paid" && paymentMethod === "online";
  void legacyCanRequestAdvance;
  void legacyOnlineAwaitingConfirm;

  const showLegacyAdvanceInfo = false;
  const locked = ["completed", "payment_pending"].includes(status) && paymentStatus !== "paid";
  const canRequestAdvance = false; // Launch-safe: stale advance request API is intentionally hidden.
  const onlineAwaitingConfirm = false; // Razorpay verification is authoritative; no driver online-confirm step.
  const cashAwaitingConfirm = locked && cashSelected && paymentStatus !== "paid";

  useEffect(() => {
    if (!locked || !bookingId) return;
    const key = `${bookingId}:${paymentStatus}:${paymentMethod}:${cashSelected}`;
    if (soundRef.current === key) return;
    soundRef.current = key;
    if (onlineAwaitingConfirm) {
      playHimRideGEventSound("payment_received").catch(() => {});
    } else if (cashAwaitingConfirm) {
      playHimRideGEventSound("cash_selected").catch(() => {});
    } else {
      playHimRideGEventSound("payment_required").catch(() => {});
    }
  }, [locked, bookingId, paymentStatus, paymentMethod, cashSelected, onlineAwaitingConfirm, cashAwaitingConfirm]);

  const requestAdvance = async () => {
    if (!bookingId || !canRequestAdvance) return;

    const amount = Math.round(Number(advanceAmount || 0) * 100) / 100;

    if (!Number.isFinite(amount) || amount <= 0 || amount > fare) {
      setError(`Advance amount ₹1 se ${money(fare)} ke beech hona chahiye.`);
      return;
    }

    setBusy("advance");
    setError("");

    try {
      const { data } = await api.post("/payments/advance/request", {
        bookingId,
        amount,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Advance request nahi bheji ja saki");
      }

      const updated = {
        ...ride,
        ...(data?.data || {}),
        advanceStatus: "requested",
        advanceRequestedAmount: amount,
      };

      playHimRideGEventSound("popup").catch(() => {});
      onUpdate?.(updated);
      setAdvanceAmount("");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Advance request nahi bheji ja saki");
    } finally {
      setBusy("");
    }
  };

  const runConfirm = async (kind) => {
    if (!bookingId) return;
    setBusy(kind);
    setError("");
    try {
      if (kind !== "cash") return;
      const { data } = await api.post("/payments/cash-confirm", { bookingId });
      if (!data?.success) throw new Error(data?.message || "Payment confirm nahi hui");
      playHimRideGEventSound(
        kind === "cash" ? "cash_payment_success" : "online_payment_success"
      ).catch(() => {});
      onUpdate?.(data?.data?.booking || data?.data || { bookingId, status: "completed", paymentStatus: "paid" });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Payment confirm nahi hui");
    } finally {
      setBusy("");
    }
  };

  return (
    <div
      className="paymentModalOverlay driverPaymentOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (!locked && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="paymentModal driverPaymentModal compactPaymentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-payment-modal-title"
      >
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">💳</div>
          <div className="paymentModalTitleGroup">
            <h2 id="driver-payment-modal-title">
              {locked ? "Payment" : "Payment Status"}
            </h2>
            <small>
              {cashAwaitingConfirm ? "Cash selected by customer" : locked ? "Waiting for customer" : "Payment complete"}
            </small>
          </div>
          {!locked && (
            <button
              type="button"
              className="paymentModalClose"
              onClick={onClose}
              aria-label="Close payment status"
            >
              ✕
            </button>
          )}
        </div>

        <div className="paymentFareBox">
          <div>
            <span>Final Fare</span>
          </div>
          <strong>{money(fare)}</strong>
        </div>

        {false && (
          <div className="driverPaymentRules">
            <span>Advance Received: {money(advancePaid)}</span>
            <span>Remaining: {money(due)}</span>
            <span>Status: {status || "pending"}</span>
          </div>
        )}

        {canRequestAdvance && (
          <div className="driverPaymentStatusBox pending">
            <span>⚡</span>
            <div style={{ width: "100%" }}>
              <small>OPTIONAL ADVANCE</small>
              <strong>Request Advance Before Ride Start</strong>
              <p>Customer ko sirf Pay Online / Pay Later options milenge.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <input
                  type="number"
                  min="1"
                  max={fare}
                  step="1"
                  inputMode="decimal"
                  value={advanceAmount}
                  onChange={(event) => setAdvanceAmount(event.target.value)}
                  placeholder={`₹1 - ₹${Math.round(fare)}`}
                  style={{
                    flex: "1 1 150px",
                    minWidth: 0,
                    padding: "11px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(245,197,24,.35)",
                    background: "rgba(0,0,0,.28)",
                    color: "#fff",
                  }}
                />
                <button
                  type="button"
                  className="driverCashReceivedPrimary"
                  disabled={Boolean(busy)}
                  onClick={requestAdvance}
                >
                  {busy === "advance" ? "Sending…" : "Request Advance"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLegacyAdvanceInfo && advanceStatus === "pay_later" && (
          <div className="paymentPlanSelectedBanner">
            <span>➡️</span>
            <div>
              <small>CUSTOMER CHOSE PAY LATER</small>
              <strong>Advance skipped</strong>
              <p>Ride normal continue karein. Complete Ride ke baad full remaining fare due hoga.</p>
            </div>
          </div>
        )}

        {showLegacyAdvanceInfo && advanceStatus === "requested" && (
          <div className="paymentPlanSelectedBanner advance">
            <span>⚡</span>
            <div>
              <small>ADVANCE REQUEST SENT</small>
              <strong>{money(ride?.advanceRequestedAmount)}</strong>
              <p>Customer Pay Online ya Pay Later choose karega.</p>
            </div>
          </div>
        )}

        {showLegacyAdvanceInfo && advanceStatus === "paid" && (
          <div className="paymentPlanSelectedBanner advance">
            <span>✅</span>
            <div>
              <small>ADVANCE RECEIVED</small>
              <strong>{money(advancePaid)}</strong>
              <p>Final ride payment me advance automatically minus ho chuka hai.</p>
            </div>
          </div>
        )}

        {locked && !onlineAwaitingConfirm && !cashAwaitingConfirm && (
          <div className="driverPaymentStatusBox pending">
            <span>⏳</span>
            <div>
              <small>WAITING</small>
              <strong>Customer payment pending</strong>
            </div>
          </div>
        )}

        {onlineAwaitingConfirm && (
          <div className="driverPaymentStatusBox paid">
            <span>✅</span>
            <div>
              <small>ONLINE PAYMENT VERIFIED</small>
              <strong>
                Payment Received {money(Number(ride?.postRidePaidAmount || due || 0))}
              </strong>
              <p>
                Razorpay payment server par verify ho chuki hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge.
              </p>
              <button
                type="button"
                className="driverCashReceivedPrimary"
                disabled={Boolean(busy)}
                onClick={() => runConfirm("online")}
              >
                {busy === "online" ? "Confirming…" : "✅ Confirm Payment Received"}
              </button>
            </div>
          </div>
        )}

        {cashAwaitingConfirm && (
          <div className="driverPaymentStatusBox pending">
            <span>💵</span>
            <div>
              <small>CASH</small>
              <strong>Receive {money(due)}</strong>
              <button
                type="button"
                className="driverCashReceivedPrimary"
                disabled={Boolean(busy)}
                onClick={() => runConfirm("cash")}
              >
                {busy === "cash" ? "Confirming…" : `Cash Received ${money(due)}`}
              </button>
            </div>
          </div>
        )}

        {status === "completed" && paymentStatus === "paid" && (
          <div className="driverPaymentStatusBox paid">
            <span>✅</span>
            <div>
              <small>COMPLETED</small>
              <strong>Payment fully received</strong>
              <p>Driver aur customer dono next ride ke liye release hain.</p>
            </div>
          </div>
        )}

        {error && <div className="paymentErrorBox">{error}</div>}

        {locked && cashAwaitingConfirm && (
          <div className="paymentLockNotice compactLockNotice">Confirm only after receiving cash</div>
        )}
      </div>
    </div>
  );
}
