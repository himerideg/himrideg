import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api";

/*
|--------------------------------------------------------------------------
| PaymentModal — HimRideG Customer Ride Payment
|--------------------------------------------------------------------------
|
| IMPORTANT PAYMENT RULES
|
| 1. Customer payment sirf driver ke ride COMPLETED karne ke baad enable hogi.
| 2. Payment amount sirf FINAL LOCKED FARE se aayega.
| 3. estimatedFare / driverOfferedFare ko payment amount ke liye use nahi karna.
| 4. Online payment UPI-only checkout kholega.
| 5. Mobile web par Razorpay UPI Intent available UPI apps open karta hai.
| 6. Desktop web par Razorpay UPI flow QR scan option dikha sakta hai.
| 7. Cash select karne par backend choice save karega; assigned driver cash
|    receive confirm karega. Customer cash selection ko "paid" nahi maana jayega.
|
| Props:
|   booking   - completed booking object with finalFare
|   onSuccess - online payment success / cash selection callback
|   onClose   - modal close callback
|
|--------------------------------------------------------------------------
*/

const STEP = Object.freeze({
  CHOOSE: "choose",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error",
  LOCKED: "locked",
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

/*
|--------------------------------------------------------------------------
| Locked Fare Only
|--------------------------------------------------------------------------
|
| Do not add fallback to estimatedFare or driverOfferedFare here.
| Payment backend also uses finalFare only.
|
*/
function lockedFareOf(booking) {
  return (
    Number(
      booking?.finalFare ??
        booking?.fare?.finalFare ??
        0
    ) || 0
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

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
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

  return {
    pickup,
    drop,
  };
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

function PaymentModal({ booking, onSuccess, onClose }) {
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

  const completed = isRideCompleted(booking);
  const alreadyPaid = isAlreadyPaid(booking);
  const fareLocked = finalFare > 0;
  const paymentAllowed =
    Boolean(bookingId) &&
    completed &&
    fareLocked &&
    !alreadyPaid;

  const [step, setStep] = useState(
    paymentAllowed ? STEP.CHOOSE : STEP.LOCKED
  );
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Reset Modal When Booking Changes
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    setPaymentMethod(null);
    setLoading(false);
    setError("");
    setReceipt(null);
    setStep(paymentAllowed ? STEP.CHOOSE : STEP.LOCKED);
  }, [bookingId, paymentAllowed]);

  /*
  |--------------------------------------------------------------------------
  | Defensive Guard
  |--------------------------------------------------------------------------
  |
  | UI ke alawa backend bhi completed status + locked final fare check karta
  | hai. Yeh helper customer ko clear message dikhane ke liye hai.
  |
  */
  const paymentLockMessage = useMemo(() => {
    if (!bookingId) {
      return "Booking ID missing hai. Ride refresh karke dobara try karein.";
    }

    if (alreadyPaid) {
      return "Is ride ka payment already complete hai.";
    }

    if (!completed) {
      return "Payment driver ke ride complete karne ke baad hi enable hoga.";
    }

    if (!fareLocked) {
      return "Final locked fare available nahi hai. Driver fare lock hone ke baad payment karein.";
    }

    return "Payment abhi available nahi hai.";
  }, [bookingId, alreadyPaid, completed, fareLocked]);

  /*
  |--------------------------------------------------------------------------
  | Online Payment — Razorpay UPI Intent / UPI QR
  |--------------------------------------------------------------------------
  |
  | Backend order amount final locked fare se create hota hai. Frontend user
  | amount edit nahi kar sakta. Checkout ko UPI-only block par land karaya gaya
  | hai, taaki mobile par UPI app intent aur desktop par QR flow mile.
  |
  */
  const handleOnlinePayment = useCallback(async () => {
    if (!paymentAllowed) {
      setError(paymentLockMessage);
      setStep(STEP.LOCKED);
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

      /*
      | Backend is the source of truth for amount.
      */
      const { data } = await api.post(
        "/payments/create-order",
        {
          bookingId,
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Payment order create nahi hua"
        );
      }

      if (data?.data?.alreadyPaid) {
        setReceipt({
          paymentMethod: METHOD.ONLINE,
          paymentStatus: "paid",
          paymentId: data?.data?.paymentId || null,
          fare: Number(data?.data?.fare || finalFare),
        });
        setStep(STEP.SUCCESS);
        onSuccess?.({
          paymentMethod: METHOD.ONLINE,
          paymentStatus: "paid",
          alreadyPaid: true,
          ...data.data,
        });
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
      } = data.data || {};

      if (!keyId || !orderId || !amount) {
        throw new Error(
          "Payment gateway details incomplete hain"
        );
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
          `Ride Payment - ${bookingId
            .slice(-8)
            .toUpperCase()}`,
        image: "/himrideg-logo.png",

        prefill: {
          name: customerName || "",
          contact: customerPhone || "",
        },

        notes: {
          bookingId,
          platform: "HimRideG",
          paymentFor: "completed_ride",
        },

        theme: {
          color: "#fbbf24",
        },

        /*
        |--------------------------------------------------------------------
        | UPI ONLY CHECKOUT
        |--------------------------------------------------------------------
        | Razorpay Standard Checkout configuration:
        | - mobile: UPI Intent / available UPI apps
        | - desktop: UPI QR scan flow
        */
        config: {
          display: {
            blocks: {
              himrideg_upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: [
              "block.himrideg_upi",
            ],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        modal: {
          escape: true,
          backdropclose: false,
          ondismiss: () => {
            setStep(STEP.CHOOSE);
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
                verifyRes?.data?.message ||
                  "Payment verify nahi hui"
              );
            }

            const verified =
              verifyRes.data.data || {};

            setReceipt({
              paymentMethod: METHOD.ONLINE,
              fare:
                Number(verified.fare) ||
                backendLockedFare,
              ...verified,
            });

            setStep(STEP.SUCCESS);

            onSuccess?.({
              paymentMethod: METHOD.ONLINE,
              paymentId:
                response.razorpay_payment_id,
              ...verified,
            });
          } catch (verifyError) {
            setError(
              verifyError?.response?.data?.message ||
                verifyError?.message ||
                "Payment verify karne mein error aaya"
            );
            setStep(STEP.ERROR);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          setError(
            response?.error?.description ||
              response?.error?.reason ||
              "Payment fail ho gayi. Dobara try karein."
          );
          setStep(STEP.ERROR);
          setLoading(false);
        }
      );

      razorpay.open();
    } catch (onlineError) {
      setError(
        onlineError?.response?.data?.message ||
          onlineError?.message ||
          "Online payment start nahi ho saka"
      );
      setStep(STEP.ERROR);
    } finally {
      setLoading(false);
    }
  }, [
    bookingId,
    finalFare,
    onSuccess,
    paymentAllowed,
    paymentLockMessage,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Cash Payment Selection
  |--------------------------------------------------------------------------
  |
  | Customer cash select karta hai. Backend is choice ko booking par save karta
  | hai. Payment status pending hi rahega. Assigned driver ke cash receive
  | confirmation ke baad backend actual paid status karega.
  |
  */
  const handleCashPayment = useCallback(async () => {
    if (!paymentAllowed) {
      setError(paymentLockMessage);
      setStep(STEP.LOCKED);
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
          data?.message ||
            "Cash payment select nahi ho saka"
        );
      }

      const selectedFare =
        Number(data?.data?.fare) ||
        finalFare;

      const cashReceipt = {
        paymentMethod: METHOD.CASH,
        paymentStatus: "pending",
        cashSelected: true,
        fare: selectedFare,
        finalFare: selectedFare,
        message:
          "Driver ko locked fare cash dijiye. Assigned driver receive confirm karega.",
      };

      setReceipt(cashReceipt);
      setStep(STEP.SUCCESS);

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
    finalFare,
    onSuccess,
    paymentAllowed,
    paymentLockMessage,
  ]);

  const handlePrimaryAction = () => {
    if (loading) {
      return;
    }

    if (paymentMethod === METHOD.ONLINE) {
      handleOnlinePayment();
      return;
    }

    if (paymentMethod === METHOD.CASH) {
      handleCashPayment();
    }
  };

  const closeAllowed =
    step !== STEP.PROCESSING;

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
        className="paymentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="himrideg-payment-title"
      >
        {/* ---------------------------------------------------------------
            Header
        ---------------------------------------------------------------- */}
        <div className="paymentModalHeader">
          <div className="paymentModalLogo">🚖</div>

          <div className="paymentModalTitleGroup">
            <h2 id="himrideg-payment-title">
              Ride Payment
            </h2>
            <small>
              Completed ride · Locked fare only
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

        {/* ---------------------------------------------------------------
            Route + Fare
        ---------------------------------------------------------------- */}
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
              Amount automatically payment me jayega
            </small>
          </div>
          <strong>
            {formatMoney(finalFare)}
          </strong>
        </div>

        {/* ---------------------------------------------------------------
            Locked State
        ---------------------------------------------------------------- */}
        {step === STEP.LOCKED && (
          <div className="paymentLockedState">
            <div className="paymentLockedIcon">
              🔒
            </div>

            <h3>Payment Locked</h3>

            <p>{paymentLockMessage}</p>

            <div className="paymentLockedRules">
              <span>
                {completed ? "✅" : "○"}
                Driver ride complete kare
              </span>
              <span>
                {fareLocked ? "✅" : "○"}
                Final fare locked ho
              </span>
              <span>
                {alreadyPaid ? "✅" : "○"}
                Payment pending ho
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

        {/* ---------------------------------------------------------------
            Choose Payment Method
        ---------------------------------------------------------------- */}
        {step === STEP.CHOOSE && (
          <div className="paymentChoose">
            <p className="paymentChooseLabel">
              Payment method chuniye:
            </p>

            <div className="paymentMethods">
              {/* Online / UPI */}
              <button
                type="button"
                className={`paymentMethodCard ${
                  paymentMethod === METHOD.ONLINE
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod(METHOD.ONLINE)
                }
              >
                <div className="paymentMethodIcon">
                  📱
                </div>

                <div className="paymentMethodInfo">
                  <strong>Online — UPI</strong>
                  <small>
                    UPI App / QR Scanner
                  </small>
                </div>

                <div className="paymentMethodCheck">
                  {paymentMethod === METHOD.ONLINE
                    ? "✅"
                    : "○"}
                </div>
              </button>

              {/* Cash */}
              <button
                type="button"
                className={`paymentMethodCard ${
                  paymentMethod === METHOD.CASH
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod(METHOD.CASH)
                }
              >
                <div className="paymentMethodIcon">
                  💵
                </div>

                <div className="paymentMethodInfo">
                  <strong>Cash Payment</strong>
                  <small>
                    Driver ko locked fare cash dein
                  </small>
                </div>

                <div className="paymentMethodCheck">
                  {paymentMethod === METHOD.CASH
                    ? "✅"
                    : "○"}
                </div>
              </button>
            </div>

            {paymentMethod === METHOD.ONLINE && (
              <div className="paymentUpiHelp">
                <div>
                  <span>📱</span>
                  <p>
                    <strong>Phone:</strong> Continue karte hi UPI checkout
                    se Google Pay, PhonePe, BHIM ya available UPI app open
                    ki ja sakti hai.
                  </p>
                </div>

                <div>
                  <span>▦</span>
                  <p>
                    <strong>Computer:</strong> UPI QR ko phone se scan karke
                    payment complete karein.
                  </p>
                </div>

                <div className="paymentAmountLockedNote">
                  🔒 Amount {formatMoney(finalFare)} locked hai — customer ko
                  amount manually enter nahi karna padega.
                </div>
              </div>
            )}

            {paymentMethod === METHOD.CASH && (
              <div className="paymentCashNotice">
                <span>💵</span>
                <p>
                  Ride completed hai. Driver ko exactly
                  <strong> {formatMoney(finalFare)} </strong>
                  cash dijiye. Driver receive confirm karne ke baad payment
                  status Paid hoga.
                </p>
              </div>
            )}

            {error && (
              <div className="paymentError">
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              className="paymentConfirmBtn"
              disabled={
                !paymentMethod ||
                loading ||
                !paymentAllowed
              }
              onClick={handlePrimaryAction}
            >
              {loading
                ? "Processing..."
                : paymentMethod === METHOD.ONLINE
                ? `Open UPI / QR · ${formatMoney(finalFare)}`
                : paymentMethod === METHOD.CASH
                ? `Select Cash · ${formatMoney(finalFare)}`
                : `Choose Payment · ${formatMoney(finalFare)}`}
            </button>

            <p className="paymentSecurityNote">
              🔐 Online amount backend ke final locked fare se create hota hai.
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------
            Processing
        ---------------------------------------------------------------- */}
        {step === STEP.PROCESSING && (
          <div className="paymentProcessing">
            <div className="paymentSpinner">
              ⏳
            </div>
            <h3>Payment process ho raha hai</h3>
            <p>
              UPI / QR payment complete hone tak window band na karein.
            </p>
            <small>
              Locked amount: {formatMoney(finalFare)}
            </small>
          </div>
        )}

        {/* ---------------------------------------------------------------
            Success / Cash Selected
        ---------------------------------------------------------------- */}
        {step === STEP.SUCCESS && (
          <div className="paymentSuccess">
            <div className="paymentSuccessIcon">
              {receipt?.paymentMethod === METHOD.CASH
                ? "💵"
                : "✅"}
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
                    <strong>
                      {" "}
                      {formatMoney(
                        receipt?.fare || finalFare
                      )}
                    </strong>
                    {" "}
                    cash dijiye.
                  </p>
                </div>

                <div className="cashInstRow">
                  <span>✅</span>
                  <p>
                    Assigned driver cash receive confirm karega. Tab ride
                    payment status Paid hoga.
                  </p>
                </div>

                <div className="cashInstRow">
                  <span>🔒</span>
                  <p>
                    Cash amount final locked fare hi hai.
                  </p>
                </div>
              </div>
            ) : (
              <div className="paymentReceiptBox">
                <div className="receiptRow">
                  <span>Amount Paid</span>
                  <strong>
                    {formatMoney(
                      receipt?.fare || finalFare
                    )}
                  </strong>
                </div>

                <div className="receiptRow">
                  <span>Method</span>
                  <strong>
                    Online UPI (Razorpay)
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

        {/* ---------------------------------------------------------------
            Error
        ---------------------------------------------------------------- */}
        {step === STEP.ERROR && (
          <div className="paymentErrorState">
            <div className="paymentErrorIcon">
              ❌
            </div>

            <h3>Payment Start Nahi Hua</h3>

            <p>
              {error ||
                "Kuch galat ho gaya. Dobara try karein."}
            </p>

            <div className="paymentErrorActions">
              <button
                type="button"
                className="paymentRetryBtn"
                onClick={() => {
                  setStep(
                    paymentAllowed
                      ? STEP.CHOOSE
                      : STEP.LOCKED
                  );
                  setError("");
                  setPaymentMethod(null);
                }}
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
      </div>
    </div>
  );
}

export default PaymentModal;