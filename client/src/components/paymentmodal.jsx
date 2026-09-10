import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import { playHimRideGEventSound } from "../utils/himridegSounds";

/*
|--------------------------------------------------------------------------
| HimRideG Customer Payment Modal — Launch Flow
|--------------------------------------------------------------------------
| Backend-authoritative post-ride payment:
| - Payment is available only after a driver-completed ride with locked fare.
| - Customer can choose Pay Online or Cash Payment.
| - Razorpay verification is authoritative for online payment.
| - For cash, customer Payment Done OR driver Cash Received can confirm it;
|   whichever reaches the backend first marks payment paid and releases driver.
| - Required payment state survives refresh/reconnect through backend status.
|--------------------------------------------------------------------------
*/

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const idOf = (booking) =>
  String(booking?._id || booking?.id || booking?.bookingId || "");

const finalFareOf = (booking) =>
  Number(booking?.finalFare ?? booking?.fare?.finalFare ?? 0) || 0;

const advancePaidOf = (booking) =>
  Math.max(0, Number(booking?.advancePaidAmount || 0) || 0);

const advanceRequestedOf = (booking) =>
  Math.max(0, Number(booking?.advanceRequestedAmount || 0) || 0);

const remainingDueOf = (booking) => {
  const explicit = Number(booking?.paymentDueAmount);
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;
  return Math.max(0, finalFareOf(booking) - advancePaidOf(booking));
};

const paymentStatusOf = (booking) =>
  String(booking?.paymentStatus ?? booking?.payment?.status ?? "pending")
    .trim()
    .toLowerCase();

const paymentMethodOf = (booking) =>
  String(booking?.paymentMethod ?? booking?.payment?.method ?? "")
    .trim()
    .toLowerCase();

const cashSelectedOf = (booking) =>
  Boolean(
    booking?.cashSelectedAt ||
      booking?.payment?.cashSelectedAt ||
      String(
        booking?.paymentChoiceAfterRide ||
          booking?.payment?.choiceAfterRide ||
          ""
      )
        .trim()
        .toLowerCase() === "cash"
  );

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), {
        once: true,
      });
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

export default function PaymentModal({
  booking,
  onSuccess,
  onBookingUpdate,
  onClose,
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [localBooking, setLocalBooking] = useState(booking || null);
  const openedSoundRef = useRef("");
  const v60CloseHandlerRef = useRef(onClose);

  useEffect(() => {
    setLocalBooking(booking || null);
  }, [booking]);

  useEffect(() => {
    v60CloseHandlerRef.current = onClose;
  }, [onClose]);

  const ride = localBooking || booking || {};
  const bookingId = idOf(ride);
  const status = String(ride?.status || "").trim().toLowerCase();
  const fare = finalFareOf(ride);
  const advancePaid = advancePaidOf(ride);
  const advanceRequested = advanceRequestedOf(ride);
  const advanceStatus = String(ride?.advanceStatus || "none").toLowerCase();
  const paymentStatus = paymentStatusOf(ride);
  const paymentMethod = paymentMethodOf(ride);
  const cashSelected = cashSelectedOf(ride);
  const remaining = remainingDueOf(ride);

  // FULL CODE RULE PRESERVATION
  // The original advance/post-ride decision logic is retained below for rollback/audit.
  // It is intentionally not active in launch mode because the old advance endpoints were stale.
  const legacyAdvanceRequestActive =
    advanceStatus === "requested" &&
    advanceRequested > 0 &&
    advancePaid <= 0 &&
    !["started", "payment_pending", "completed", "cancelled"].includes(status);
  const legacyPostRideRequired = status === "payment_pending";
  const legacyOnlinePaidAwaitingDriver =
    legacyPostRideRequired && paymentStatus === "paid" && paymentMethod === "online";
  void legacyAdvanceRequestActive;
  void legacyOnlinePaidAwaitingDriver;

  /*
   * Legacy payment UX copy retained for the strict Full Code Rule.
   * It is not rendered by the compact launch popup.
   *
   * Previous customer flow:
   * - Advance Payment Request
   * - Driver requested advance amount
   * - Customer could choose Pay Online or Pay Later
   * - Advance amount was deducted from the final fare
   * - Ride-ended banner explained that payment was required
   * - Online verification waited for a separate driver confirmation
   * - Cash selection explained that driver confirmation completed the ride
   * - Payment lock notice explained refresh/reopen recovery
   *
   * Launch flow now keeps only the useful actions:
   * - Final Fare
   * - Pay Online
   * - Cash Payment
   * - Waiting for driver cash confirmation
   *
   * Backend-verified online payment is authoritative, so the extra driver
   * confirmation step is disabled. The legacy text remains here so no
   * historical behavior/context is lost while the visible popup stays clean.
   */

  const advanceRequestActive = false; // Launch-safe: stale advance APIs are disabled until backend support is authoritative.

  const postRideRequired = ["completed", "payment_pending"].includes(status) && paymentStatus !== "paid";
  const onlinePaidAwaitingDriver = false; // Online payment is final after Razorpay verification on the backend.

  const required = postRideRequired;
  const context = "post_ride";
  const payableAmount = remaining;

  const title = useMemo(() => {
    if (cashSelected) return "Cash Payment";
    if (postRideRequired) return "Payment";
    return "Payment Status";
  }, [advanceRequestActive, onlinePaidAwaitingDriver, cashSelected, postRideRequired]);

  useEffect(() => {
    if (!required || !bookingId) return;
    const key = `${bookingId}:${context}:${paymentStatus}:${advanceStatus}:${cashSelected ? "cash" : ""}`;
    if (openedSoundRef.current === key) return;
    openedSoundRef.current = key;
    playHimRideGEventSound(
      advanceRequestActive ? "popup" : onlinePaidAwaitingDriver ? "payment_success" : "payment_required"
    ).catch(() => {});
  }, [
    required,
    bookingId,
    context,
    paymentStatus,
    advanceStatus,
    cashSelected,
    advanceRequestActive,
    onlinePaidAwaitingDriver,
  ]);

  const mergeBooking = (patch = {}) => {
    const merged = { ...ride, ...patch };
    setLocalBooking(merged);
    onBookingUpdate?.(merged);
    return merged;
  };

  const refreshStatus = async () => {
    if (!bookingId) return ride;
    try {
      const { data } = await api.get(`/payments/${bookingId}/status`);
      const fresh = data?.data?.booking || data?.data || data?.booking || null;
      if (fresh && typeof fresh === "object") return mergeBooking(fresh);
    } catch {
      // Dashboard polling/socket remains a second source of truth.
    }
    return ride;
  };

  const payOnline = async () => {
    if (!bookingId || payableAmount <= 0) {
      setError("Payable amount valid nahi hai");
      return;
    }

    setBusy("online");
    setError("");

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) {
        throw new Error("Razorpay checkout load nahi ho saka");
      }

      const { data: orderResponse } = await api.post("/payments/create-order", {
        bookingId,
        paymentContext: context,
      });

      const order = orderResponse?.data || {};
      if (!order?.orderId || !order?.keyId || !Number(order?.amount)) {
        throw new Error(orderResponse?.message || "Payment order ready nahi hua");
      }

      const expectedPaise = Math.round(payableAmount * 100);
      if (Number(order.amount) !== expectedPaise) {
        throw new Error("Server payment amount ride amount se match nahi karti");
      }

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "HimRideG",
          description:
            context === "advance"
              ? `Advance ${money(payableAmount)}`
              : `Remaining ride payment ${money(payableAmount)}`,
          order_id: order.orderId,
          prefill: {
            name: order.customerName || "",
            email: order.customerEmail || "",
            contact: order.customerPhone || "",
          },
          notes: {
            bookingId,
            paymentContext: context,
          },
          theme: { color: "#f5c518" },
          handler: async (response) => {
            try {
              const { data: verified } = await api.post("/payments/verify", {
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (!verified?.success) {
                throw new Error(verified?.message || "Payment verify nahi hui");
              }

              const payload = verified?.data || {};
              const merged = mergeBooking({
                status: "completed",
                paymentStatus: "paid",
                paymentMethod: "online",
                postRidePaidAmount: Number(payload.paidAmount || payload.fare || payableAmount),
                paidAt: payload.paidAt || new Date().toISOString(),
              });
              playHimRideGEventSound("online_payment_success").catch(() => {});
              onSuccess?.({
                ...payload,
                booking: merged,
                paymentContext: "post_ride",
                method: "online",
                requiresDriverConfirmation: false,
              });

              await refreshStatus();
              resolve();
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          modal: {
            ondismiss: () => resolve(),
          },
        });
        checkout.on("payment.failed", (failure) => {
          api
            .post("/payments/failed", {
              bookingId,
              reason:
                failure?.error?.description ||
                failure?.error?.reason ||
                "Payment failed",
            })
            .catch(() => {});
          reject(new Error(failure?.error?.description || "Payment failed"));
        });
        checkout.open();
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Payment failed");
    } finally {
      setBusy("");
    }
  };

  const payAdvanceLater = async () => {
    if (!bookingId || !advanceRequestActive) return;
    setBusy("later");
    setError("");
    try {
      const { data } = await api.post("/payments/advance/pay-later", { bookingId });
      if (!data?.success) throw new Error(data?.message || "Pay Later save nahi hua");
      const merged = mergeBooking({ advanceStatus: "pay_later" });
      onSuccess?.({
        ...(data?.data || {}),
        booking: merged,
        paymentContext: "advance",
        method: "pay-later",
      });
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Pay Later save nahi hua");
    } finally {
      setBusy("");
    }
  };

  const selectCash = async () => {
    if (!bookingId || !postRideRequired || remaining <= 0) return;
    setBusy("cash");
    setError("");
    try {
      const { data } = await api.post("/payments/cash-select", { bookingId });
      if (!data?.success) throw new Error(data?.message || "Cash select nahi hua");
      const merged = mergeBooking({
        status: status === "payment_pending" ? "payment_pending" : "completed",
        paymentStatus: "pending",
        paymentMethod: "cash",
        cashSelectedAt: data?.data?.cashSelectedAt || new Date().toISOString(),
      });
      playHimRideGEventSound("cash_selected").catch(() => {});
      onSuccess?.({
        ...(data?.data || {}),
        booking: merged,
        paymentContext: "post_ride",
        method: "cash-selected",
        requiresDriverConfirmation: true,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Cash select nahi hua");
    } finally {
      setBusy("");
    }
  };

  const confirmCustomerCashDone = async () => {
    if (
      !bookingId ||
      !postRideRequired ||
      !cashSelected ||
      paymentStatus === "paid"
    ) {
      return;
    }

    setBusy("cash_done");
    setError("");

    try {
      const { data } = await api.post(
        "/payments/cash-confirm",
        { bookingId }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Cash payment confirm nahi hui"
        );
      }

      const payload = data?.data || {};
      const merged = mergeBooking({
        ...payload,
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "cash",
        paidAt:
          payload?.paidAt ||
          new Date().toISOString(),
      });

      playHimRideGEventSound(
        "cash_payment_success"
      ).catch(() => {});

      onSuccess?.({
        ...payload,
        booking: merged,
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "cash",
        paymentContext: "post_ride",
        method: "cash",
        confirmedBy: "customer",
        requiresDriverConfirmation: false,
      });

      await refreshStatus();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Cash payment confirm nahi hui"
      );
    } finally {
      setBusy("");
    }
  };

  /*
  |------------------------------------------------------------------------
  | V60 Ultra-Compact Launch Payment Popup — ADD-ONLY
  |------------------------------------------------------------------------
  | User-facing launch UI intentionally shows only the actions that matter:
  | Final Fare -> Pay Online / Cash Payment.
  | Cash selection -> Customer Payment Done OR Driver Cash Received; first confirmation wins.
  | Online verified -> short success state, then popup closes automatically.
  | The complete previous V57/V58/V59 JSX remains below for rollback/audit.
  |------------------------------------------------------------------------
  */
  const v60UltraCompactPaymentUI = true;

  useEffect(() => {
    if (!v60UltraCompactPaymentUI || paymentStatus !== "paid" || !bookingId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      v60CloseHandlerRef.current?.();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [bookingId, paymentStatus]);

  if (!bookingId) return null;

  if (v60UltraCompactPaymentUI) {
    return (
      <div className="paymentModalOverlay v60PaymentOverlay" role="presentation">
        <div
          className="paymentModal compactPaymentModal v60PaymentModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="himrideg-v60-payment-title"
        >
          <div className="v60PaymentTitle" id="himrideg-v60-payment-title">
            Payment
          </div>

          <div className="v60PaymentFare">
            <span>Final Fare</span>
            <strong>{money(fare)}</strong>
          </div>

          {paymentStatus === "paid" ? (
            <div className="v60PaymentState success">
              ✅ Payment Successful
            </div>
          ) : cashSelected ? (
            <div className="v60CashSelectedFlow">
              <div className="v60PaymentState waiting">
                Cash selected
              </div>

              <button
                type="button"
                className="v60PaymentAction primary v60CashDoneButton"
                disabled={Boolean(busy)}
                onClick={confirmCustomerCashDone}
              >
                {busy === "cash_done"
                  ? "Confirming…"
                  : "Payment Done"}
              </button>

              <small className="v60PaymentIndependentNote">
                Cash de diya hai to Payment Done dabayein. Driver bhi Cash Received independently confirm kar sakta hai.
              </small>
            </div>
          ) : (
            <div className="v60PaymentActions">
              <button
                type="button"
                className="v60PaymentAction primary"
                disabled={Boolean(busy) || payableAmount <= 0}
                onClick={payOnline}
              >
                {busy === "online" ? "Opening…" : "Pay Online"}
              </button>

              <button
                type="button"
                className="v60PaymentAction secondary"
                disabled={Boolean(busy) || remaining <= 0}
                onClick={selectCash}
              >
                {busy === "cash" ? "Selecting…" : "Cash Payment"}
              </button>
            </div>
          )}

          {error && <div className="paymentErrorBox v60PaymentError">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className="paymentModalOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (!required && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="paymentModal compactPaymentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="himrideg-payment-title"
      >
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">💳</div>
          <div className="paymentModalTitleGroup">
            <h2 id="himrideg-payment-title">{title}</h2>
            <small>
              {postRideRequired ? "Payment complete karein" : "Payment status"}
            </small>
          </div>
          {!required && (
            <button
              type="button"
              className="paymentModalClose"
              onClick={onClose}
              aria-label="Close payment"
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
            <span>Remaining: {money(remaining)}</span>
            <span>Ride Status: {status || "pending"}</span>
          </div>
        )}

        {advanceRequestActive && (
          <div className="paymentPlanSelectedBanner advance">
            <span>⚡</span>
            <div>
              <small>DRIVER REQUESTED ADVANCE</small>
              <strong>{money(advanceRequested)}</strong>
              <p>
                Advance pay hone par final fare se automatically minus hoga. Pay Later choose karne par ride process continue ho sakti hai aur amount end me remaining payment me rahega.
              </p>
            </div>
          </div>
        )}

        {postRideRequired && !cashSelected && (
          <div className="compactPaymentHint">Choose payment method</div>
        )}

        {onlinePaidAwaitingDriver && (
          <div className="driverPaymentStatusBox paid">
            <span>✅</span>
            <div>
              <small>ONLINE PAYMENT VERIFIED</small>
              <strong>Waiting for Driver Payment Received confirmation</strong>
              <p>
                Aapka payment server par verify ho chuka hai. Driver confirmation ke baad ride automatically Completed hogi.
              </p>
            </div>
          </div>
        )}

        {postRideRequired && cashSelected && paymentStatus !== "paid" && (
          <div className="driverPaymentStatusBox pending">
            <span>💵</span>
            <div>
              <small>CASH SELECTED</small>
              <strong>Driver ko {money(remaining)} cash dein</strong>
            </div>
          </div>
        )}

        {!onlinePaidAwaitingDriver && !(postRideRequired && cashSelected) && (
          <div className="paymentMethodGrid">
            <button
              type="button"
              className="paymentMethodCard"
              disabled={Boolean(busy) || payableAmount <= 0}
              onClick={payOnline}
            >
              <span>📱</span>
              <strong>{busy === "online" ? "Opening…" : `Pay Online ${money(payableAmount)}`}</strong>
              <small>UPI / Card / Netbanking</small>
            </button>

            {advanceRequestActive ? (
              <button
                type="button"
                className="paymentMethodCard"
                disabled={Boolean(busy)}
                onClick={payAdvanceLater}
              >
                <span>⏳</span>
                <strong>{busy === "later" ? "Saving…" : "Pay Later"}</strong>
                <small>Advance skip; final remaining later</small>
              </button>
            ) : (
              <button
                type="button"
                className="paymentMethodCard"
                disabled={Boolean(busy) || remaining <= 0}
                onClick={selectCash}
              >
                <span>💵</span>
                <strong>{busy === "cash" ? "Selecting…" : `Cash Payment ${money(remaining)}`}</strong>
                <small>Pay driver in cash</small>
              </button>
            )}
          </div>
        )}

        {error && <div className="paymentErrorBox">{error}</div>}

        {required && cashSelected && (
          <div className="paymentLockNotice compactLockNotice">Waiting for driver cash confirmation</div>
        )}
      </div>
    </div>
  );
}
