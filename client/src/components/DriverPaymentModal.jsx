import React, {
  useMemo,
} from "react";

/*
|--------------------------------------------------------------------------
| DriverPaymentModal — Driver-side mirror of customer payment plan
|--------------------------------------------------------------------------
|
| Driver payment option select nahi karta. Customer ke selected option aur
| payment status ko live mirror karta hai. Advance payment pending ho to driver
| ko clearly bataya jata hai ki ride-action buttons locked hain.
|
|--------------------------------------------------------------------------
*/

function finalFareOf(ride) {
  return (
    Number(
      ride?.finalFare ??
        ride?.fare?.finalFare ??
        0
    ) || 0
  );
}

function paymentPlanOf(ride) {
  const explicit = String(ride?.paymentPlan || "").trim();

  if (
    [
      "online_after_ride",
      "advance",
      "scheduled",
    ].includes(explicit)
  ) {
    return explicit;
  }

  if (ride?.paymentTiming === "pay_now") {
    return "advance";
  }

  return null;
}

function paymentStatusOf(ride) {
  return String(
    ride?.paymentStatus ??
      ride?.payment?.status ??
      "pending"
  )
    .trim()
    .toLowerCase();
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatSchedule(value) {
  if (!value) {
    return "Ride schedule ke according";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ride schedule ke according";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DriverPaymentModal({
  ride,
  onClose,
}) {
  const fare = useMemo(
    () => finalFareOf(ride),
    [ride]
  );

  const plan = useMemo(
    () => paymentPlanOf(ride),
    [ride]
  );

  const paymentStatus = paymentStatusOf(ride);
  const paid = paymentStatus === "paid";
  const advancePending =
    plan === "advance" && !paid;

  return (
    <div
      className="paymentModalOverlay driverPaymentOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="paymentModal driverPaymentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-payment-modal-title"
      >
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">💳</div>
          <div className="paymentModalTitleGroup">
            <h2 id="driver-payment-modal-title">
              Customer Payment
            </h2>
            <small>
              Driver view · Customer payment option mirror
            </small>
          </div>
          <button
            type="button"
            className="paymentModalClose"
            onClick={onClose}
            aria-label="Close payment status"
          >
            ✕
          </button>
        </div>

        <div className="paymentFareBox">
          <div>
            <span>Final Locked Fare</span>
            <small>Customer ke liye locked amount</small>
          </div>
          <strong>{formatMoney(fare)}</strong>
        </div>

        {!plan && (
          <div className="driverPaymentPendingChoice">
            <span>⏳</span>
            <strong>Customer Payment Option Choose Kar Raha Hai</strong>
            <p>
              Payment Online, Payment Advance ya Scheduled Payment me se customer option select karega.
            </p>

            <div className="driverPaymentOptionPreview">
              <article>
                <b>📱 Payment Online</b>
                <small>Ride complete hone ke baad</small>
              </article>
              <article>
                <b>⚡ Payment Advance</b>
                <small>Ride se pehle Pay Now</small>
              </article>
              <article>
                <b>📅 Scheduled Payment</b>
                <small>Later + Pay Now option</small>
              </article>
            </div>
          </div>
        )}

        {plan === "online_after_ride" && (
          <div className="paymentPlanSelectedBanner">
            <span>📱</span>
            <div>
              <small>CUSTOMER SELECTED</small>
              <strong>Payment Online</strong>
              <p>
                Ride complete hone ke baad customer Online/UPI ya Cash choose karega.
              </p>
            </div>
          </div>
        )}

        {plan === "advance" && (
          <div className="paymentPlanSelectedBanner advance">
            <span>{paid ? "✅" : "⚡"}</span>
            <div>
              <small>CUSTOMER SELECTED</small>
              <strong>Payment Advance</strong>
              <p>
                {paid
                  ? "Advance payment paid hai. Driver ride actions unlocked hain."
                  : "Advance payment pending hai. Ride action buttons payment paid hone tak locked rahenge."}
              </p>
            </div>
          </div>
        )}

        {plan === "scheduled" && (
          <div className="paymentPlanSelectedBanner scheduled">
            <span>{paid ? "✅" : "📅"}</span>
            <div>
              <small>CUSTOMER SELECTED</small>
              <strong>Scheduled Payment</strong>
              <p>
                {paid
                  ? "Customer ne Pay Now karke payment complete kar di."
                  : `Payment scheduled: ${formatSchedule(
                      ride?.paymentScheduledAt ||
                        ride?.travelDate
                    )}. Customer ke paas Pay Now option available hai.`}
              </p>
            </div>
          </div>
        )}

        <div
          className={`driverPaymentStatusBox ${
            paid
              ? "paid"
              : advancePending
                ? "blocked"
                : "pending"
          }`}
        >
          <span>
            {paid
              ? "✅"
              : advancePending
                ? "🔒"
                : "⏳"}
          </span>
          <div>
            <small>PAYMENT STATUS</small>
            <strong>
              {paid
                ? "Paid"
                : advancePending
                  ? "Advance Payment Pending — Actions Locked"
                  : "Payment Pending"}
            </strong>
          </div>
        </div>

        <div className="driverPaymentRules">
          <span>✅ Final fare locked</span>
          <span>
            {advancePending
              ? "🔒 Advance paid hone ke baad pickup action"
              : "✅ Fare lock ke baad ride process allowed"}
          </span>
          <span>
            {paid
              ? "✅ Payment complete"
              : "⏳ Payment status live update hoga"}
          </span>
        </div>

        <button
          type="button"
          className="paymentDoneBtn"
          onClick={onClose}
        >
          Close ✓
        </button>
      </div>
    </div>
  );
}
