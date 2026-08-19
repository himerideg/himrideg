import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api";

/*
|--------------------------------------------------------------------------
| PaymentModal — HimRideG Fare-Lock + Payment Flow
|--------------------------------------------------------------------------
|
| FINAL RULES
|
| 1. Final fare lock ke bina payment option choose nahi hoga.
| 2. Payment amount sirf FINAL LOCKED FARE se aayega.
| 3. Customer ko fare lock hote hi 3 payment plans milenge:
|      A. Payment Online    = ride complete hone ke baad Online/Cash
|      B. Payment Advance   = full locked fare abhi online pay
|      C. Scheduled Payment = later pay; Pay Now hamesha available
| 4. Advance select hone par driver pickup action payment paid hone tak locked.
| 5. Scheduled Payment me customer kabhi bhi Pay Now kar sakta hai.
| 6. Ride complete + payment pending = Waiting for Payment.
| 7. Cash choice sirf normal post-ride payment ke andar preserve hai.
| 8. estimatedFare / driverOfferedFare ko payment amount ke liye use nahi karna.
|
|--------------------------------------------------------------------------
*/

const STEP = Object.freeze({
  PLAN: "plan",
  PLAN_STATUS: "plan_status",
  METHOD: "method",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error",
  LOCKED: "locked",
});

const PLAN = Object.freeze({
  ONLINE_AFTER_RIDE: "online_after_ride",
  ADVANCE: "advance",
  SCHEDULED: "scheduled",
});

const METHOD = Object.freeze({
  ONLINE: "online",
  CASH: "cash",
});

function bookingIdOf(booking) {
  return String(
    booking?._id ||
      booking?.id ||
      booking?.bookingId ||
      ""
  );
}

function lockedFareOf(booking) {
  return (
    Number(
      booking?.finalFare ??
        booking?.fare?.finalFare ??
        0
    ) || 0
  );
}

function isFareLocked(booking) {
  return (
    String(booking?.fareStatus || "") === "fare_accepted" &&
    lockedFareOf(booking) > 0
  );
}

function isRideCompleted(booking) {
  return String(booking?.status || "").toLowerCase() === "completed";
}

function isAlreadyPaid(booking) {
  return (
    booking?.paymentStatus === "paid" ||
    booking?.payment?.status === "paid"
  );
}

function paymentPlanOf(booking) {
  const plan = String(booking?.paymentPlan || "").trim();

  if (
    [
      PLAN.ONLINE_AFTER_RIDE,
      PLAN.ADVANCE,
      PLAN.SCHEDULED,
    ].includes(plan)
  ) {
    return plan;
  }

  if (booking?.paymentTiming === "pay_now") {
    return PLAN.ADVANCE;
  }

  return null;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
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

function rideLabel(booking) {
  const pickup =
    booking?.pickup?.address ||
    booking?.pickupAddress ||
    (typeof booking?.pickup === "string" ? booking.pickup : "") ||
    "Pickup";

  const drop =
    booking?.dropoff?.address ||
    booking?.drop?.address ||
    booking?.dropAddress ||
    (typeof booking?.dropoff === "string" ? booking.dropoff : "") ||
    (typeof booking?.drop === "string" ? booking.drop : "") ||
    "Destination";

  return { pickup, drop };
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function initialStep(booking) {
  if (!isFareLocked(booking)) {
    return STEP.LOCKED;
  }

  if (isAlreadyPaid(booking)) {
    return STEP.SUCCESS;
  }

  const plan = paymentPlanOf(booking);

  if (!plan) {
    return STEP.PLAN;
  }

  if (
    plan === PLAN.ONLINE_AFTER_RIDE &&
    isRideCompleted(booking)
  ) {
    return STEP.METHOD;
  }

  return STEP.PLAN_STATUS;
}

function PaymentModal({
  booking,
  onSuccess,
  onBookingUpdate,
  onClose,
}) {
  const bookingId = useMemo(
    () => bookingIdOf(booking),
    [booking]
  );

  const finalFare = useMemo(
    () => lockedFareOf(booking),
    [booking]
  );

  const route = useMemo(
    () => rideLabel(booking),
    [booking]
  );

  const fareLocked = isFareLocked(booking);
  const completed = isRideCompleted(booking);
  const alreadyPaid = isAlreadyPaid(booking);

  const [plan, setPlan] = useState(() => paymentPlanOf(booking));
  const [step, setStep] = useState(() => initialStep(booking));
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [scheduledAt, setScheduledAt] = useState(
    booking?.paymentScheduledAt || booking?.travelDate || null
  );

  // ADD-ONLY: payment failure audit so real-money failures remain traceable.
  const reportPaymentFailure = useCallback(async (reason, details = {}) => {
    try {
      await api.post("/payments/failed", {
        bookingId,
        reason: String(reason || "Payment failed").slice(0, 450),
        ...details,
      });
    } catch {
      // Audit failure must never block customer retry UX.
    }
  }, [bookingId]);

  useEffect(() => {
    setPlan(paymentPlanOf(booking));
    setStep(initialStep(booking));
    setPaymentMethod(null);
    setLoading(false);
    setError("");
    setReceipt(
      isAlreadyPaid(booking)
        ? {
            paymentMethod:
              booking?.paymentMethod ||
              booking?.payment?.method ||
              METHOD.ONLINE,
            paymentStatus: "paid",
            fare: lockedFareOf(booking),
            paymentId: booking?.razorpayPaymentId || null,
          }
        : null
    );
    setScheduledAt(
      booking?.paymentScheduledAt || booking?.travelDate || null
    );
  }, [bookingId, booking]);

  const planTitle = useMemo(() => {
    if (plan === PLAN.ADVANCE) return "Advance Payment";
    if (plan === PLAN.SCHEDULED) return "Scheduled Payment";
    if (plan === PLAN.ONLINE_AFTER_RIDE) return "Payment Online";
    return "Choose Payment Option";
  }, [plan]);

  const paymentLockMessage = useMemo(() => {
    if (!bookingId) {
      return "Booking ID missing hai. Ride refresh karke dobara try karein.";
    }

    if (!fareLocked) {
      return "Final fare lock hone ke baad payment page enable hoga.";
    }

    return "Payment abhi available nahi hai.";
  }, [bookingId, fareLocked]);

  const selectPlan = useCallback(
    async (nextPlan) => {
      if (!fareLocked || !bookingId || loading) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data } = await api.post(
          "/payments/select-plan",
          {
            bookingId,
            plan: nextPlan,
          }
        );

        if (!data?.success) {
          throw new Error(
            data?.message || "Payment option select nahi hua"
          );
        }

        const updated = data?.data || {};

        setPlan(nextPlan);
        setScheduledAt(
          updated.paymentScheduledAt || booking?.travelDate || null
        );
        setStep(
          nextPlan === PLAN.ONLINE_AFTER_RIDE && completed
            ? STEP.METHOD
            : STEP.PLAN_STATUS
        );

        onBookingUpdate?.({
          bookingId,
          paymentPlan: nextPlan,
          paymentTiming: updated.paymentTiming,
          paymentScheduledAt: updated.paymentScheduledAt || null,
          paymentStatus: updated.paymentStatus || "pending",
        });
      } catch (planError) {
        setError(
          planError?.response?.data?.message ||
            planError?.message ||
            "Payment option select nahi ho saka"
        );
        setStep(STEP.ERROR);
      } finally {
        setLoading(false);
      }
    }, [
      bookingId,
      booking?.travelDate,
      completed,
      fareLocked,
      loading,
      onBookingUpdate,
    ]
  );

  const handleOnlinePayment = useCallback(async () => {
    if (!fareLocked || !bookingId || alreadyPaid) {
      setError(paymentLockMessage);
      setStep(STEP.LOCKED);
      return;
    }

    if (!plan) {
      setStep(STEP.PLAN);
      return;
    }

    if (
      plan === PLAN.ONLINE_AFTER_RIDE &&
      !completed
    ) {
      setStep(STEP.PLAN_STATUS);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay load nahi hua. Internet connection check karke dobara try karein."
        );
      }

      const { data } = await api.post(
        "/payments/create-order",
        { bookingId }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Payment order create nahi hua"
        );
      }

      if (data?.data?.alreadyPaid) {
        const paidReceipt = {
          paymentMethod: METHOD.ONLINE,
          paymentStatus: "paid",
          paymentId: data?.data?.paymentId || null,
          fare: Number(data?.data?.fare || finalFare),
          paymentPlan: plan,
        };

        setReceipt(paidReceipt);
        setStep(STEP.SUCCESS);
        onSuccess?.(paidReceipt);
        return;
      }

      const {
        keyId,
        orderId,
        amount,
        currency,
        fare: serverFare,
        customerName,
        customerPhone,
        paymentContext,
      } = data.data || {};

      if (!keyId || !orderId || !amount) {
        throw new Error("Payment gateway details incomplete hain");
      }

      const backendLockedFare = Number(serverFare || 0);

      if (
        backendLockedFare <= 0 ||
        Math.round(backendLockedFare * 100) !== Number(amount)
      ) {
        throw new Error(
          "Locked fare aur payment amount match nahi kar rahe. Ride refresh karke dobara try karein."
        );
      }

      setStep(STEP.PROCESSING);

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        order_id: orderId,
        name: "HimRideG",
        description:
          plan === PLAN.ADVANCE
            ? "Advance Ride Payment"
            : plan === PLAN.SCHEDULED
              ? "Scheduled Ride Payment - Pay Now"
              : "Ride Payment",
        image: "/himrideg-logo.png",

        prefill: {
          name: customerName || "",
          contact: customerPhone || "",
          email: booking?.customer?.email || booking?.customerEmail || "",
        },

        notes: {
          bookingId,
          platform: "HimRideG",
          paymentPlan: plan,
          paymentContext: paymentContext || "post_ride",
        },

        theme: {
          color: "#fbbf24",
        },

        config: {
          display: {
            blocks: {
              himrideg_upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.himrideg_upi"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        modal: {
          escape: true,
          backdropclose: false,
          ondismiss: () => {
            setStep(
              plan === PLAN.ONLINE_AFTER_RIDE && completed
                ? STEP.METHOD
                : STEP.PLAN_STATUS
            );
            setLoading(false);
          },
        },

        handler: async (response) => {
          try {
            const verifyRes = await api.post(
              "/payments/verify",
              {
                bookingId,
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              }
            );

            if (!verifyRes?.data?.success) {
              throw new Error(
                verifyRes?.data?.message || "Payment verify nahi hui"
              );
            }

            const verified = verifyRes.data.data || {};

            const paidReceipt = {
              paymentMethod: METHOD.ONLINE,
              paymentPlan: plan,
              paymentStatus: "paid",
              fare:
                Number(verified.fare) ||
                backendLockedFare,
              paymentId:
                response.razorpay_payment_id,
              ...verified,
            };

            setReceipt(paidReceipt);
            setStep(STEP.SUCCESS);

            onBookingUpdate?.({
              bookingId,
              paymentPlan: plan,
              paymentStatus: "paid",
              paymentMethod: METHOD.ONLINE,
              razorpayPaymentId:
                response.razorpay_payment_id,
            });

            onSuccess?.(paidReceipt);
          } catch (verifyError) {
            const failureMessage =
              verifyError?.response?.data?.message ||
              verifyError?.message ||
              "Payment verify karne mein error aaya";
            await reportPaymentFailure(failureMessage, { stage: "verify" });
            setError(failureMessage);
            setStep(STEP.ERROR);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", async (response) => {
        const failureMessage =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment fail ho gayi. Dobara try karein.";
        await reportPaymentFailure(failureMessage, {
          stage: "checkout",
          razorpay_order_id: response?.error?.metadata?.order_id || "",
          razorpay_payment_id: response?.error?.metadata?.payment_id || "",
          code: response?.error?.code || "",
        });
        setError(failureMessage);
        setStep(STEP.ERROR);
        setLoading(false);
      });

      razorpay.open();
    } catch (onlineError) {
      const failureMessage =
        onlineError?.response?.data?.message ||
        onlineError?.message ||
        "Online payment start nahi ho saka";
      await reportPaymentFailure(failureMessage, { stage: "create_order" });
      setError(failureMessage);
      setStep(STEP.ERROR);
    } finally {
      setLoading(false);
    }
  }, [
    alreadyPaid,
    bookingId,
    completed,
    fareLocked,
    finalFare,
    onBookingUpdate,
    onSuccess,
    paymentLockMessage,
    plan,
    reportPaymentFailure,
  ]);

  const handleCashPayment = useCallback(async () => {
    if (
      !fareLocked ||
      !completed ||
      plan !== PLAN.ONLINE_AFTER_RIDE
    ) {
      setError(
        "Cash payment sirf normal post-ride payment me available hai."
      );
      setStep(STEP.ERROR);
      return;
    }

    setLoading(true);
    setError("");
    setStep(STEP.PROCESSING);

    try {
      const { data } = await api.post(
        "/payments/select-method",
        {
          bookingId,
          method: METHOD.CASH,
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Cash payment select nahi ho saka"
        );
      }

      const selectedFare =
        Number(data?.data?.fare) || finalFare;

      const cashReceipt = {
        paymentMethod: METHOD.CASH,
        paymentPlan: plan,
        paymentStatus: "pending",
        cashSelected: true,
        fare: selectedFare,
        finalFare: selectedFare,
        message:
          "Driver ko locked fare cash dijiye. Assigned driver receive confirm karega.",
      };

      setReceipt(cashReceipt);
      setStep(STEP.SUCCESS);

      onBookingUpdate?.({
        bookingId,
        paymentPlan: plan,
        paymentMethod: METHOD.CASH,
        paymentChoiceAfterRide: METHOD.CASH,
        paymentStatus: "pending",
      });

      onSuccess?.(cashReceipt);
    } catch (cashError) {
      setError(
        cashError?.response?.data?.message ||
          cashError?.message ||
          "Cash payment select nahi ho saka"
      );
      setStep(STEP.ERROR);
    } finally {
      setLoading(false);
    }
  }, [
    bookingId,
    completed,
    fareLocked,
    finalFare,
    onBookingUpdate,
    onSuccess,
    plan,
  ]);

  const closeAllowed = step !== STEP.PROCESSING;

  const retryStep = () => {
    setError("");

    if (!fareLocked) {
      setStep(STEP.LOCKED);
      return;
    }

    if (!plan) {
      setStep(STEP.PLAN);
      return;
    }

    if (plan === PLAN.ONLINE_AFTER_RIDE && completed) {
      setStep(STEP.METHOD);
      return;
    }

    setStep(STEP.PLAN_STATUS);
  };

  return (
    <div
      className="paymentModalOverlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          closeAllowed
        ) {
          onClose?.();
        }
      }}
      role="presentation"
    >
      <div
        className="paymentModal paymentPlanModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="himrideg-payment-title"
      >
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">🚖</div>

          <div className="paymentModalTitleGroup">
            <h2 id="himrideg-payment-title">
              {planTitle}
            </h2>
            <small>
              Final fare locked · Secure HimRideG payment
            </small>
          </div>

          {closeAllowed && (
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

        <div className="paymentRideSummary">
          <div className="paymentRouteLine">
            <span className="paymentRouteDot pickup" />
            <div>
              <small>Pickup</small>
              <strong>{route.pickup}</strong>
            </div>
          </div>

          <div className="paymentRouteConnector" />

          <div className="paymentRouteLine">
            <span className="paymentRouteDot drop" />
            <div>
              <small>Destination</small>
              <strong>{route.drop}</strong>
            </div>
          </div>
        </div>

        <div className="paymentFareBox">
          <div>
            <span>Final Locked Fare</span>
            <small>
              Payment amount automatically locked fare se aayega
            </small>
          </div>
          <strong>{formatMoney(finalFare)}</strong>
        </div>

        {step === STEP.LOCKED && (
          <div className="paymentLockedState">
            <div className="paymentLockedIcon">🔒</div>
            <h3>Payment Options Locked</h3>
            <p>{paymentLockMessage}</p>
            <div className="paymentLockedRules">
              <span>
                {fareLocked ? "✅" : "○"}
                Customer final fare accept kare
              </span>
              <span>
                {finalFare > 0 ? "✅" : "○"}
                Locked fare available ho
              </span>
            </div>
            <button
              type="button"
              className="paymentCancelBtn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}

        {step === STEP.PLAN && (
          <div className="paymentChoose paymentPlanChoose">
            <p className="paymentChooseLabel">
              Payment option chuniye:
            </p>

            <div className="paymentPlanGrid">
              <button
                type="button"
                className="paymentPlanCard"
                disabled={loading}
                onClick={() => selectPlan(PLAN.ONLINE_AFTER_RIDE)}
              >
                <span className="paymentPlanIcon">📱</span>
                <strong>Payment Online</strong>
                <small>
                  Ride complete hone ke baad Online/UPI payment. Cash option bhi post-ride available rahega.
                </small>
                <em>After Ride →</em>
              </button>

              <button
                type="button"
                className="paymentPlanCard advance"
                disabled={loading}
                onClick={() => selectPlan(PLAN.ADVANCE)}
              >
                <span className="paymentPlanIcon">⚡</span>
                <strong>Payment Advance</strong>
                <small>
                  Full locked fare abhi Pay Now. Payment paid hone ke baad driver ride actions unlock honge.
                </small>
                <em>Pay Before Ride →</em>
              </button>

              <button
                type="button"
                className="paymentPlanCard scheduled"
                disabled={loading}
                onClick={() => selectPlan(PLAN.SCHEDULED)}
              >
                <span className="paymentPlanIcon">📅</span>
                <strong>Scheduled Payment</strong>
                <small>
                  Payment later scheduled rahegi. Pay Now button kisi bhi time use kar sakte ho.
                </small>
                <em>Schedule + Pay Now →</em>
              </button>
            </div>

            {loading && (
              <div className="paymentInlineStatus">
                Payment option save ho raha hai...
              </div>
            )}

            {error && (
              <div className="paymentError">⚠️ {error}</div>
            )}
          </div>
        )}

        {step === STEP.PLAN_STATUS && (
          <div className="paymentChoose paymentPlanStatus">
            {plan === PLAN.ONLINE_AFTER_RIDE && (
              <>
                <div className="paymentPlanSelectedBanner">
                  <span>📱</span>
                  <div>
                    <small>SELECTED</small>
                    <strong>Payment Online</strong>
                    <p>
                      Ride complete hone ke baad Pay Online / Cash options khulenge.
                    </p>
                  </div>
                </div>

                {!completed ? (
                  <div className="paymentWaitingBox">
                    <span>🚕</span>
                    <strong>Ride Complete Hone Ka Wait</strong>
                    <p>
                      Driver ride complete karega tab payment popup automatically khulega.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="paymentConfirmBtn"
                    onClick={() => setStep(STEP.METHOD)}
                  >
                    Choose Online / Cash · {formatMoney(finalFare)}
                  </button>
                )}
              </>
            )}

            {plan === PLAN.ADVANCE && (
              <>
                <div className="paymentPlanSelectedBanner advance">
                  <span>⚡</span>
                  <div>
                    <small>SELECTED</small>
                    <strong>Payment Advance</strong>
                    <p>
                      Driver ke ride-action buttons advance payment complete hone tak locked rahenge.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="paymentConfirmBtn"
                  disabled={loading}
                  onClick={handleOnlinePayment}
                >
                  {loading
                    ? "Processing..."
                    : `Pay Advance Now · ${formatMoney(finalFare)}`}
                </button>
              </>
            )}

            {plan === PLAN.SCHEDULED && (
              <>
                <div className="paymentPlanSelectedBanner scheduled">
                  <span>📅</span>
                  <div>
                    <small>SCHEDULED</small>
                    <strong>Scheduled Payment</strong>
                    <p>
                      Scheduled for: {formatSchedule(scheduledAt)}
                    </p>
                  </div>
                </div>

                <div className="paymentScheduledActions">
                  <button
                    type="button"
                    className="paymentConfirmBtn"
                    disabled={loading}
                    onClick={handleOnlinePayment}
                  >
                    {loading
                      ? "Processing..."
                      : `Pay Now · ${formatMoney(finalFare)}`}
                  </button>

                  <button
                    type="button"
                    className="paymentCancelBtn"
                    disabled={loading}
                    onClick={onClose}
                  >
                    Pay Later — Keep Scheduled
                  </button>
                </div>
              </>
            )}

            <button
              type="button"
              className="paymentChangePlanBtn"
              disabled={loading || completed}
              onClick={() => setStep(STEP.PLAN)}
            >
              Change Payment Option
            </button>

            {error && (
              <div className="paymentError">⚠️ {error}</div>
            )}
          </div>
        )}

        {step === STEP.METHOD && (
          <div className="paymentChoose">
            <p className="paymentChooseLabel">
              Ride complete hai — payment method chuniye:
            </p>

            <div className="paymentMethods">
              <button
                type="button"
                className={`paymentMethodCard ${
                  paymentMethod === METHOD.ONLINE ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod(METHOD.ONLINE)}
              >
                <div className="paymentMethodIcon">📱</div>
                <div className="paymentMethodInfo">
                  <strong>Pay Online — UPI</strong>
                  <small>UPI App / QR Scanner</small>
                </div>
                <div className="paymentMethodCheck">
                  {paymentMethod === METHOD.ONLINE ? "✅" : "○"}
                </div>
              </button>

              <button
                type="button"
                className={`paymentMethodCard ${
                  paymentMethod === METHOD.CASH ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod(METHOD.CASH)}
              >
                <div className="paymentMethodIcon">💵</div>
                <div className="paymentMethodInfo">
                  <strong>Cash Payment</strong>
                  <small>Driver ko locked fare cash dein</small>
                </div>
                <div className="paymentMethodCheck">
                  {paymentMethod === METHOD.CASH ? "✅" : "○"}
                </div>
              </button>
            </div>

            {paymentMethod === METHOD.ONLINE && (
              <div className="paymentUpiHelp">
                <div>
                  <span>📱</span>
                  <p>
                    <strong>Phone:</strong> UPI app intent open ho sakta hai.
                  </p>
                </div>
                <div>
                  <span>▦</span>
                  <p>
                    <strong>Computer:</strong> UPI QR ko phone se scan karke pay karein.
                  </p>
                </div>
                <div className="paymentAmountLockedNote">
                  🔒 Amount {formatMoney(finalFare)} locked hai.
                </div>
              </div>
            )}

            {paymentMethod === METHOD.CASH && (
              <div className="paymentCashNotice">
                <span>💵</span>
                <p>
                  Driver ko exactly
                  <strong> {formatMoney(finalFare)} </strong>
                  cash dijiye. Driver receive confirm karega.
                </p>
              </div>
            )}

            {error && (
              <div className="paymentError">⚠️ {error}</div>
            )}

            <button
              type="button"
              className="paymentConfirmBtn"
              disabled={!paymentMethod || loading}
              onClick={() => {
                if (paymentMethod === METHOD.ONLINE) {
                  handleOnlinePayment();
                  return;
                }
                if (paymentMethod === METHOD.CASH) {
                  handleCashPayment();
                }
              }}
            >
              {loading
                ? "Processing..."
                : paymentMethod === METHOD.ONLINE
                  ? `Pay Online · ${formatMoney(finalFare)}`
                  : paymentMethod === METHOD.CASH
                    ? `Select Cash · ${formatMoney(finalFare)}`
                    : `Choose Payment · ${formatMoney(finalFare)}`}
            </button>
          </div>
        )}

        {step === STEP.PROCESSING && (
          <div className="paymentProcessing">
            <div className="paymentSpinner">⏳</div>
            <h3>Payment process ho raha hai</h3>
            <p>
              Payment process complete hone tak window band na karein.
            </p>
            <small>Locked amount: {formatMoney(finalFare)}</small>
          </div>
        )}

        {step === STEP.SUCCESS && (
          <div className="paymentSuccess">
            <div className="paymentSuccessIcon">
              {receipt?.paymentMethod === METHOD.CASH ? "💵" : "✅"}
            </div>

            <h3>
              {receipt?.paymentMethod === METHOD.CASH
                ? "Cash Selected"
                : "Payment Successful! 🎉"}
            </h3>

            {receipt?.paymentMethod === METHOD.CASH ? (
              <div className="paymentCashInstructions">
                <div className="cashInstRow">
                  <span>💰</span>
                  <p>
                    Driver ko
                    <strong> {formatMoney(receipt?.fare || finalFare)}</strong>
                    {" "}cash dijiye.
                  </p>
                </div>
                <div className="cashInstRow">
                  <span>✅</span>
                  <p>
                    Driver cash receive confirm karega. Tab payment Paid hoga.
                  </p>
                </div>
              </div>
            ) : (
              <div className="paymentReceiptBox">
                <div className="receiptRow">
                  <span>Amount Paid</span>
                  <strong>{formatMoney(receipt?.fare || finalFare)}</strong>
                </div>
                <div className="receiptRow">
                  <span>Payment Plan</span>
                  <strong>
                    {plan === PLAN.ADVANCE
                      ? "Advance"
                      : plan === PLAN.SCHEDULED
                        ? "Scheduled / Pay Now"
                        : "Online"}
                  </strong>
                </div>
                {receipt?.paymentId && (
                  <div className="receiptRow">
                    <span>Payment ID</span>
                    <strong className="paymentId">
                      {receipt.paymentId}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="paymentDoneBtn"
              onClick={onClose}
            >
              Done ✓
            </button>
          </div>
        )}

        {step === STEP.ERROR && (
          <div className="paymentErrorState">
            <div className="paymentErrorIcon">❌</div>
            <h3>Payment Action Complete Nahi Hua</h3>
            <p>
              {error || "Kuch galat ho gaya. Dobara try karein."}
            </p>
            <div className="paymentErrorActions">
              <button
                type="button"
                className="paymentRetryBtn"
                onClick={retryStep}
              >
                Dobara Try Karo
              </button>
              <button
                type="button"
                className="paymentCancelBtn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="paymentSecurityNote paymentGlobalSecurityNote">
          🔐 Payment amount backend ke final locked fare se hi create hota hai.
        </p>
      </div>
    </div>
  );
}

export default PaymentModal;
