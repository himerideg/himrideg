import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../api";
import socket from "../socket";
import RideMap from "../RideMap";
import CustomerBookRide from "../components/CustomerBookRide";
import PaymentModal from "../components/paymentmodal";

import "../dashboard.css";
import "../customer-dashboard-v2.css";
import "../payment-modal.css";
import "../fare-negotiation.css";

const ACTIVE_STATUSES = [
  "pending",
  "searching",
  "searching_driver",
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "arrived",
  "started",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const idOf = (value) =>
  String(value?._id || value?.id || value || "");

const addressOf = (value, fallback) =>
  value?.address ||
  (typeof value === "string" ? value : "") ||
  fallback;

const pickupOf = (ride) =>
  addressOf(ride?.pickup || ride?.pickupAddress, "Pickup");

const dropOf = (ride) =>
  addressOf(ride?.dropoff || ride?.drop || ride?.dropAddress, "Destination");

const fareOf = (ride) =>
  Number(
    ride?.finalFare ??
      ride?.fare?.finalFare ??
      ride?.driverOfferedFare ??
      0
  ) || 0;

const distanceOf = (ride) =>
  Number(
    ride?.distanceKm ??
      ride?.distance ??
      ride?.route?.distanceKm ??
      ride?.fare?.distanceKm ??
      0
  ) || 0;

const dateOf = (ride) =>
  new Date(
    ride?.travelDate || ride?.scheduledAt || ride?.createdAt || Date.now()
  );

const statusText = (status) =>
  ({
    pending: "Searching driver",
    searching: "Searching driver",
    searching_driver: "Searching driver",
    driver_assigned: "Driver assigned",
    accepted: "Accepted",
    negotiating: "Fare Negotiation",
    fare_offered: "Driver ne fare offer kiya",
    fare_accepted: "Fare Lock ho gaya ✅",
    driver_arriving: "Driver arriving",
    driver_arrived: "Driver arrived",
    arrived: "Driver arrived",
    started: "Ride started",
    completed: "Completed",
    cancelled: "Cancelled",
  })[status] || "Pending";

function initials(name = "Customer") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

async function resizeProfileImage(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Sirf image file select karein");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image 8 MB se chhoti honi chahiye");
  }
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = source;
  });
  const size = 480;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const crop = Math.min(image.width, image.height);
  const sx = (image.width - crop) / 2;
  const sy = (image.height - crop) / 2;
  context.drawImage(image, sx, sy, crop, crop, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.78);
}

/* ==========================================================================
   Fare Negotiation UI Component — Fixed flow
   ========================================================================== */
function FareNegotiationUI({ ride, onAccept, onCounter, onReject }) {
  const [counterInput, setCounterInput] = useState("");
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterSent, setCounterSent] = useState(false);

  const bookingId = ride?._id || ride?.id;
  const fareStatus = ride?.fareStatus;
  const driverOffer = Number(ride?.driverOfferedFare || 0);
  const customerCounter = Number(ride?.customerCounterFare || 0);
  const driverFinalFare = Number(ride?.driverFinalFareProposal || 0);
  const finalFare = Number(ride?.finalFare || ride?.fare?.finalFare || 0);
  const offerCount = Number(ride?.fareOfferCount || 0);

  if (!bookingId) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Locked Fare
  |--------------------------------------------------------------------------
  |
  | Fare sirf customer ke final driver fare accept karne ke baad lock hota hai.
  |
  */

  if (fareStatus === "fare_accepted" || ride?.status === "fare_accepted") {
    return (
      <div className="fareLockedBox">
        <div className="fareLockedIcon">🔒</div>

        <div>
          <small>Final Fare Locked</small>

          <strong>
            ₹{money(finalFare || driverFinalFare || driverOffer)}
          </strong>

          <p>
            Customer ne driver ka final fare accept kar diya hai.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Driver FINAL Fare — Customer ke paas EXACTLY Accept / Reject
  |--------------------------------------------------------------------------
  */

  if (
    fareStatus === "driver_final" &&
    driverFinalFare > 0
  ) {
    return (
      <div className="fareNegotiateBox fareFinalDecisionBox">
        <div className="fareOfferHeader">
          <span>🔐 Driver Final Fare</span>

          <strong>
            ₹{money(driverFinalFare)}
          </strong>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#aaa",
            margin: "8px 0"
          }}
        >
          Driver ne final fare bhej diya hai. Accept karne par fare lock ho
          jayega. Reject karne par current driver release hoga aur ride dobara
          driver search me jayegi.
        </p>

        <div className="fareActions">
          <button
            className="fareBtn fareAccept"
            onClick={() =>
              onAccept(
                bookingId,
                driverFinalFare
              )
            }
          >
            ✅ Accept ₹{money(driverFinalFare)}
          </button>

          <button
            className="fareBtn fareReject"
            onClick={() =>
              onReject(
                bookingId
              )
            }
          >
            ❌ Reject
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Customer Counter Sent — Driver Final Fare ka wait
  |--------------------------------------------------------------------------
  */

  if (
    fareStatus === "customer_countered" ||
    counterSent
  ) {
    return (
      <div className="fareWaitBox">
        <div className="fareWaitIcon">⏳</div>

        <div>
          <small>Your Negotiation Fare</small>

          <strong>
            ₹{money(customerCounter || counterInput)}
          </strong>

          <p>
            Waiting for driver final fare...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Driver Initial Fare — Customer Negotiation Only
  |--------------------------------------------------------------------------
  |
  | Latest HimRideG rule:
  |
  | Driver initial fare
  |      ↓
  | Customer negotiation/counter
  |      ↓
  | Driver FINAL fare
  |      ↓
  | Customer Accept / Reject
  |
  | Is stage par initial fare direct lock nahi hota.
  |
  */

  if (
    fareStatus === "driver_offered" &&
    driverOffer > 0
  ) {
    return (
      <div className="fareNegotiateBox">
        <div className="fareOfferHeader">
          <span>🚖 Driver Initial Fare</span>

          <strong>
            ₹{money(driverOffer)}
          </strong>
        </div>

        {showCounterInput ? (
          <div className="fareCounterInput">
            <input
              type="number"
              placeholder="Aapka negotiation fare (₹)"
              value={counterInput}
              onChange={(event) =>
                setCounterInput(
                  event.target.value
                )
              }
              min={50}
              max={10000}
              autoFocus
            />

            <div className="fareCounterActions">
              <button
                className="fareBtn fareCounterSend"
                onClick={() => {
                  const amount =
                    Number(counterInput);

                  if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                  ) {
                    return;
                  }

                  onCounter(
                    bookingId,
                    amount
                  );

                  setCounterSent(true);

                  setShowCounterInput(false);
                }}
              >
                Send ₹{counterInput || "?"}
              </button>

              <button
                className="fareBtn fareBtnCancel"
                onClick={() => {
                  setShowCounterInput(false);
                  setCounterInput("");
                }}
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="fareActions">
            <button
              className="fareBtn fareCounter"
              onClick={() =>
                setShowCounterInput(true)
              }
            >
              💬 Negotiate Fare
            </button>
          </div>
        )}

        <small className="fareWarning">
          Initial fare direct lock nahi hoga. Aap negotiation fare bhejenge,
          phir driver final fare bhejega.
        </small>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Legacy Rejected State Fallback
  |--------------------------------------------------------------------------
  */

  if (fareStatus === "fare_rejected") {
    return (
      <div className="fareWaitBox">
        <div className="fareWaitIcon">↻</div>

        <div>
          <small>Fare negotiation updated</small>

          <p>
            Driver response / new dispatch ka wait karein.
          </p>
        </div>
      </div>
    );
  }

  if (
    ride?.status === "accepted" ||
    ride?.status === "driver_assigned"
  ) {
    return (
      <div className="fareWaitBox">
        <div className="fareWaitIcon">₹</div>

        <div>
          <small>Waiting for Driver Fare</small>

          <p>
            Driver initial fare bhejne ke baad negotiation yahin start hogi.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/* ==========================================================================
   Main CustomerDashboard Component
   ========================================================================== */
/* ==========================================================================
   Rating Modal Component
   ========================================================================== */
function RatingModal({ ride, onSubmit, onSkip }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const driverName =
    (typeof ride?.driver === "object" ? ride?.driver?.name : null) ||
    ride?.driverName ||
    "Driver";

  const fareAmount = fareOf(ride);

  const handleSubmit = async () => {
    if (stars === 0) {
      setError("Kripya star rating zaroor dein");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(stars, review.trim());
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Rating submit nahi ho saki");
      setSubmitting(false);
    }
  };

  const labels = ["", "Bahut bura", "Theek nahi tha", "Theek tha", "Achha tha", "Bahut achha!"];

  return (
    <div className="cvRatingShade">
      <div className="cvRatingModal">
        <div className="cvRatingHeader">
          <span className="cvRatingIcon">⭐</span>
          <h2>Ride Complete!</h2>
          <p>Aapki ride successfully complete ho gayi. {driverName} ko rate karein.</p>
        </div>

        {fareAmount > 0 && (
          <div className="cvRatingFare">
            <span>Total Fare</span>
            <strong>₹{money(fareAmount)}</strong>
          </div>
        )}

        <div className="cvRatingRoute">
          <span>
            <i className="cvRatingDot green" />
            {pickupOf(ride)}
          </span>
          <span>→</span>
          <span>
            <i className="cvRatingDot red" />
            {dropOf(ride)}
          </span>
        </div>

        <div className="cvStarRow">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`cvStar ${n <= (hovered || stars) ? "active" : ""}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>

        {(hovered || stars) > 0 && (
          <p className="cvStarLabel">{labels[hovered || stars]}</p>
        )}

        <textarea
          className="cvRatingReview"
          placeholder="Koi comment likhein (optional)..."
          value={review}
          maxLength={300}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
        />

        {error && <p className="cvRatingError">{error}</p>}

        <div className="cvRatingActions">
          <button
            type="button"
            className="cvRatingSubmit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submit ho raha hai..." : "Rating Submit Karein"}
          </button>
          <button
            type="button"
            className="cvRatingSkip"
            onClick={onSkip}
            disabled={submitting}
          >
            Baad mein karein
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard({
  user,
  booking,
  setBooking,
  bookings = [],
  mapData,
  setMapData,
  createBooking,
  loadBookings,
  updateBooking,
  logout,
  onUserUpdate,
}) {
  const [bookOpen, setBookOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rideTab, setRideTab] = useState("active");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Customer Wallet
  |--------------------------------------------------------------------------
  | User model me wallet already available hai. Customer dashboard par sirf
  | customer-useful balance dikhaya ja raha hai; driver commission fields ko
  | intentionally expose nahi kiya gaya.
  */
  const customerWalletBalance = Number(user?.wallet?.balance || 0);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paidBookingIds, setPaidBookingIds] = useState(new Set());

  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingRide, setRatingRide] = useState(null);
  /*
  | Rated/skipped ride IDs localStorage mein rakho taaki page
  | refresh karne par popup dobara na aaye
  */
  const RATED_STORAGE_KEY = "himrideg_rated_rides";

  const loadRatedIds = () => {
    try {
      const saved = localStorage.getItem(RATED_STORAGE_KEY);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  };

  const ratedRideIdsRef = useRef(loadRatedIds());

  const markRideHandled = useCallback((rideId) => {
    if (!rideId) return;
    ratedRideIdsRef.current.add(String(rideId));
    try {
      // Sirf last 50 IDs rakho taaki storage na bhare
      const ids = Array.from(ratedRideIdsRef.current).slice(-50);
      localStorage.setItem(RATED_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage fail ho toh ignore karo
    }
  }, []);

  // Local bookings state (socket updates ke liye)
  const [localBookings, setLocalBookings] = useState(bookings);

  const fileInputRef = useRef(null);
  const paymentShownRef = useRef(new Set());

  const [profile, setProfile] = useState({
    name: user?.name || "Customer",
    phone: user?.phone || "",
    alternativePhone: user?.alternativePhone || "",
    email: user?.email || "",
    profileImage: user?.profileImage || "",
  });

  // Sync localBookings with prop
  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const activeRide = useMemo(
    () => localBookings.find((ride) => ACTIVE_STATUSES.includes(ride.status)) || null,
    [localBookings]
  );

  const completedRides = useMemo(
    () => localBookings.filter((ride) => ride.status === "completed"),
    [localBookings]
  );

  const scheduledRides = useMemo(
    () =>
      localBookings.filter(
        (ride) =>
          !["completed", "cancelled"].includes(ride.status) &&
          dateOf(ride).getTime() > Date.now() + 5 * 60 * 1000
      ),
    [localBookings]
  );

  const activeRides = useMemo(
    () => localBookings.filter((ride) => ACTIVE_STATUSES.includes(ride.status)),
    [localBookings]
  );

  const tabRides =
    rideTab === "completed"
      ? completedRides
      : rideTab === "scheduled"
      ? scheduledRides
      : activeRides;

  const driver =
    typeof activeRide?.driver === "object" ? activeRide.driver : {};

  const driverName =
    driver?.name || activeRide?.driverName || "Driver will be assigned";
  const driverPhone = driver?.phone || activeRide?.driverPhone || "";
  const vehicle = driver?.driverProfile?.vehicle || driver?.vehicle || {};
  const vehicleName =
    [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
    activeRide?.vehicleName ||
    "HimRideG Taxi";
  const vehicleNumber =
    vehicle?.registrationNumber ||
    driver?.driverProfile?.vehicleNumber ||
    activeRide?.vehicleNumber ||
    "Number pending";
  const driverPhoto =
    driver?.profileImage || driver?.photo || activeRide?.driverPhoto || "";
  const driverLocation =
    activeRide?.driverLocation ||
    activeRide?.currentDriverLocation ||
    driver?.currentLocation ||
    null;

  const canCancel =
    activeRide &&
    !["started", "completed", "cancelled"].includes(activeRide.status);

  /* ──────────────────────────────────────────────────────────────────
     Socket Event Listeners — Fare Negotiation + Payment
  ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    // Fare offered by driver
    const handleFareOffered = (data) => {
      setLocalBookings((prev) =>
        prev.map((b) =>
          idOf(b) === String(data.bookingId)
            ? { ...b, fareStatus: "driver_offered", driverOfferedFare: data.driverOfferedFare, fareOfferCount: data.fareOfferCount }
            : b
        )
      );
    };

    // Driver final fare — customer Accept / Reject decision
    const handleFinalFareOffered = (data) => {
      setLocalBookings((prev) =>
        prev.map((b) =>
          idOf(b) === String(data.bookingId)
            ? {
                ...b,
                fareStatus: "driver_final",
                driverFinalFareProposal: Number(
                  data.driverFinalFareProposal || 0
                ),
                customerCounterFare: Number(
                  data.customerCounterFare ||
                  b.customerCounterFare ||
                  0
                ),
                status: data.status || "negotiating"
              }
            : b
        )
      );
    };

    // Fare accepted (final customer confirmation)
    const handleFareAccepted = (data) => {
      setLocalBookings((prev) =>
        prev.map((b) =>
          idOf(b) === String(data.bookingId)
            ? { ...b, fareStatus: "fare_accepted", finalFare: data.finalFare, status: "fare_accepted" }
            : b
        )
      );
    };

    // Fare rejected
    const handleFareRejected = (data) => {
      setLocalBookings((prev) =>
        prev.map((b) =>
          idOf(b) === String(data.bookingId)
            ? { ...b, fareStatus: "fare_rejected" }
            : b
        )
      );
    };

    // Payment requested
    const handlePaymentRequested = (data) => {
      const bid = String(data.bookingId);
      if (paymentShownRef.current.has(bid)) return;
      paymentShownRef.current.add(bid);
      setPaymentBooking(data);
      setShowPaymentModal(true);
    };

    socket.on("fare:offered", handleFareOffered);
    socket.on("fare:final-offered", handleFinalFareOffered);
    socket.on("fare:accepted", handleFareAccepted);
    socket.on("fare:rejected", handleFareRejected);
    socket.on("payment:requested", handlePaymentRequested);

    return () => {
      socket.off("fare:offered", handleFareOffered);
      socket.off("fare:final-offered", handleFinalFareOffered);
      socket.off("fare:accepted", handleFareAccepted);
      socket.off("fare:rejected", handleFareRejected);
      socket.off("payment:requested", handlePaymentRequested);
    };
  }, []);

  /* ──────────────────────────────────────────────────────────────────
     Auto Payment Modal — Ride Complete hone pe
  ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!activeRide) return;

    const bid = idOf(activeRide);
    if (
      activeRide.status === "completed" &&
      fareOf(activeRide) > 0 &&
      activeRide.paymentStatus !== "paid" &&
      !paidBookingIds.has(bid) &&
      !paymentShownRef.current.has(bid)
    ) {
      const timer = setTimeout(() => {
        paymentShownRef.current.add(bid);
        setPaymentBooking(activeRide);
        setShowPaymentModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeRide?.status, activeRide?.paymentStatus]);

  /* ──────────────────────────────────────────────────────────────────
     Auto Rating Modal — Ride Complete + Payment Done ke baad
  ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    // Modal already khula hai toh kuch mat karo
    if (showRatingModal) return;

    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const now = Date.now();

    // Sirf HAAL HI MEIN complete hui ride ke liye popup dikhao.
    // Purani rides ke liye customer ko baar-baar pareshan mat karo.
    const unratedCompleted = localBookings.find((ride) => {
      if (ride.status !== "completed") return false;
      if (ride.rating?.customerRating) return false;
      if (ratedRideIdsRef.current.has(String(idOf(ride)))) return false;

      const completedTime = new Date(
        ride.completedAt || ride.updatedAt || ride.createdAt || 0
      ).getTime();

      // 2 ghante se purani ride ke liye popup nahi
      if (!completedTime || now - completedTime > TWO_HOURS) {
        // Purani ride ko permanently skip mark kar do
        markRideHandled(idOf(ride));
        return false;
      }

      return true;
    });

    if (!unratedCompleted) return;

    // Payment wali ride ke liye payment complete hone ka wait karo
    const fare = fareOf(unratedCompleted);
    const isPaid =
      unratedCompleted.paymentStatus === "paid" ||
      unratedCompleted.payment?.status === "paid" ||
      /*
      |--------------------------------------------------------------------------
      | Cash payment driver confirmation ke baad hi PAID
      |--------------------------------------------------------------------------
      |
      | Legacy flow me paymentMethod === "cash" ko turant paid maana ja raha tha.
      | Launch flow me cash tabhi paid hoga jab assigned driver cash-confirm kare.
      |
      */
      fare === 0;

    if (!isPaid) return;

    // 2.5 second delay taaki payment modal pehle close ho sake
    const timer = setTimeout(() => {
      if (!ratedRideIdsRef.current.has(String(idOf(unratedCompleted)))) {
        setRatingRide(unratedCompleted);
        setShowRatingModal(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [localBookings, showRatingModal, markRideHandled]);

  /* ──────────────────────────────────────────────────────────────────
     Rating Submit Handler
  ────────────────────────────────────────────────────────────────── */
  const handleRatingSubmit = useCallback(
    async (stars, review) => {
      if (!ratingRide) return;
      const bookingId = idOf(ratingRide);
      await api.post(`/rides/${bookingId}/rate-driver`, {
        rating: stars,
        review,
      });
      // Mark as rated taaki dobara na aaye (localStorage mein bhi)
      markRideHandled(bookingId);
      // Local state bhi update karo
      setLocalBookings((prev) =>
        prev.map((b) =>
          idOf(b) === bookingId
            ? { ...b, rating: { ...b.rating, customerRating: stars, customerReview: review } }
            : b
        )
      );
      setShowRatingModal(false);
      setRatingRide(null);
    },
    [ratingRide, markRideHandled]
  );

  const handleRatingSkip = useCallback(() => {
    if (ratingRide) {
      // Skip karne par bhi permanently mark karo -
      // page refresh ke baad dobara popup nahi aayega
      markRideHandled(idOf(ratingRide));
    }
    setShowRatingModal(false);
    setRatingRide(null);
  }, [ratingRide, markRideHandled]);

  /* ──────────────────────────────────────────────────────────────────
     Fare Negotiation Handlers
  ────────────────────────────────────────────────────────────────── */
  const handleFareAccept = useCallback(
    async (bookingId, amount) => {
      try {
        const { data } =
          await api.post(
            `/fares/${bookingId}/customer-accept-final`,
            {}
          );

        const result =
          data?.data ||
          data ||
          {};

        const acceptedFare =
          Number(
            result.finalFare ||
            amount ||
            0
          );

        setLocalBookings(
          (
            previous
          ) =>
            previous.map(
              (
                booking
              ) =>
                idOf(
                  booking
                ) ===
                String(
                  bookingId
                )
                  ? {
                      ...booking,
                      fareStatus:
                        "fare_accepted",
                      status:
                        "fare_accepted",
                      finalFare:
                        acceptedFare,
                      driverFinalFareProposal:
                        acceptedFare
                    }
                  : booking
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Pay Now
        |--------------------------------------------------------------------------
        |
        | Pay Now booking me final fare accept hote hi online payment open hogi.
        |
        */

        if (
          result.paymentRequiredNow
        ) {
          const currentRide =
            localBookings.find(
              (
                booking
              ) =>
                idOf(
                  booking
                ) ===
                String(
                  bookingId
                )
            );

          setPaymentBooking({
            ...(currentRide || {}),
            _id:
              currentRide?._id ||
              bookingId,
            finalFare:
              acceptedFare,
            fareStatus:
              "fare_accepted",
            status:
              "fare_accepted",
            paymentTiming:
              "pay_now",
            paymentMethod:
              "online"
          });

          setShowPaymentModal(
            true
          );
        }

        await loadBookings?.();
      } catch (error) {
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Final fare accept nahi ho saka"
        );
      }
    },
    [
      loadBookings,
      localBookings
    ]
  );

  const handleFareCounter = useCallback((bookingId, counterAmount) => {
    if (!counterAmount || Number(counterAmount) <= 0) {
      alert("Valid amount enter karo");
      return;
    }

    socket.emit(
      "fare:counter",
      { bookingId, amount: Number(counterAmount) },
      (res) => {
        if (res?.success) {
          setLocalBookings((prev) =>
            prev.map((b) =>
              idOf(b) === String(bookingId)
                ? {
                    ...b,
                    fareStatus: "customer_countered",
                    customerCounterFare: Number(counterAmount),
                    status: "negotiating"
                  }
                : b
            )
          );
        } else {
          alert(res?.message || "Counter offer nahi ho saka");
        }
      }
    );
  }, []);

  const handleFareReject = useCallback(
    async (bookingId) => {
      try {
        await api.post(
          `/fares/${bookingId}/customer-reject-final`,
          {}
        );

        setLocalBookings(
          (
            previous
          ) =>
            previous.map(
              (
                booking
              ) =>
                idOf(
                  booking
                ) ===
                String(
                  bookingId
                )
                  ? {
                      ...booking,
                      fareStatus:
                        "fare_rejected",
                      driver:
                        null,
                      status:
                        "searching_driver"
                    }
                  : booking
            )
        );

        await loadBookings?.();
      } catch (error) {
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Final fare reject nahi hua"
        );
      }
    },
    [
      loadBookings
    ]
  );

  /* ──────────────────────────────────────────────────────────────────
     Payment Success Handler
  ────────────────────────────────────────────────────────────────── */
  const handlePaymentSuccess = useCallback((paymentData) => {
    const bid = idOf(paymentBooking);
    const method = String(paymentData?.paymentMethod || "").toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Cash is NOT paid until assigned driver confirms receipt
    |--------------------------------------------------------------------------
    |
    | PaymentModal uses onSuccess when the customer selects Cash so that the
    | UI can close gracefully. Do not add a cash booking to paidBookingIds here.
    | The backend /payments/cash-confirm endpoint is the only authority that can
    | mark a cash ride paid, and it is restricted to the assigned driver.
    |
    */

    if (bid && method === "online") {
      setPaidBookingIds((prev) => new Set([...prev, bid]));
    }

    loadBookings?.();

    if (method === "online") {
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentBooking(null);
      }, 3000);
      return;
    }

    if (method === "cash") {
      setShowPaymentModal(false);
      setPaymentBooking(null);
    }
  }, [paymentBooking, loadBookings]);

  /* ──────────────────────────────────────────────────────────────────
     Other Handlers
  ────────────────────────────────────────────────────────────────── */
  const openBookRide = () => {
    setBooking((current) => ({
      ...current,
      customerPhone: current.customerPhone || user?.phone || "",
      bookingMode: current.bookingMode || "now",
      riderFor: current.riderFor || "self",
    }));
    setBookOpen(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileSaving(true);
    try {
      const { data } = await api.patch("/auth/customer/profile", {
        name: profile.name.trim(),
        alternativePhone: profile.alternativePhone.trim(),
        email: profile.email.trim(),
        profileImage: profile.profileImage,
      });
      const updatedUser = data?.data?.user || data?.user || data?.data;
      if (updatedUser?._id) {
        localStorage.setItem("himrideg_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("himrideg_user", JSON.stringify(updatedUser));
        setProfile({
          name: updatedUser.name || "Customer",
          phone: updatedUser.phone || "",
          alternativePhone: updatedUser.alternativePhone || "",
          email: updatedUser.email || "",
          profileImage: updatedUser.profileImage || "",
        });
        onUserUpdate?.(updatedUser);
      }
      setProfileMessage(data?.message || "Profile successfully update ho gayi");
    } catch (error) {
      setProfileMessage(
        error?.response?.data?.message || error?.message || "Profile update nahi hui"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const profileImage = await resizeProfileImage(file);
      setProfile((current) => ({ ...current, profileImage }));
      setProfileMessage("");
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      event.target.value = "";
    }
  };

  const cancelActiveRide = () => {
    if (
      !activeRide ||
      !window.confirm("Kya aap ride cancel karna chahte hain?")
    ) return;
    updateBooking(idOf(activeRide), "cancelled");
  };

  const scrollToRides = (tab) => {
    setRideTab(tab);
    document
      .getElementById("customer-rides")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWallet = () => {
    document
      .getElementById("customer-wallet")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  /*
  |--------------------------------------------------------------------------
  | Book Ride -> Back To Main Dashboard
  |--------------------------------------------------------------------------
  | Parent createBooking success par ride object/true return karta hai. Sirf
  | successful booking par modal close hota hai; validation/API error par form
  | wahi khula rehta hai taaki customer details correct kar sake.
  */
  const createBookingAndReturnToDashboard = async (event) => {
    const result = await createBooking(event);

    if (!result) {
      return;
    }

    setBookOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ──────────────────────────────────────────────────────────────────
     Render
  ────────────────────────────────────────────────────────────────── */
  return (
    <div className="customerV2">
      <header className="cvTopbar">
        <button
          className="cvBrand"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span>HG</span>
          <strong>
            Him<span>Ride</span>G<small>Customer</small>
          </strong>
        </button>

        <nav>
          <button className="active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Dashboard
          </button>
          <button onClick={() => scrollToRides("active")}>My Rides</button>
          <button onClick={openBookRide}>Bookings</button>
          <button onClick={scrollToWallet}>Wallet</button>
          <button onClick={() => setProfileOpen(true)}>Profile</button>
          <button onClick={() => window.alert("Support: HimRideG team se contact karein")}>
            Support
          </button>
        </nav>

        <div className="cvTopActions">
          <button className="cvBell" type="button" aria-label="Notifications">
            ♧<b>{activeRides.length}</b>
          </button>

          <button
            className="cvUserButton"
            type="button"
            onClick={() => setProfileOpen(true)}
          >
            <span className="cvAvatar">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} />
              ) : (
                initials(profile.name)
              )}
            </span>
            <strong>{profile.name}</strong>
            <span>⌄</span>
          </button>

          <button className="cvLogout" type="button" onClick={logout}>
            ⇥ Logout
          </button>
        </div>
      </header>

      <main className="cvMain">
        <section className="cvHero">
          <div>
            <h1>
              Namaste, <span>{profile.name}</span>
            </h1>
            <p>Aapki ride, aapke apne pahadon mein.</p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button onClick={openBookRide}>🚕 &nbsp; Book New Ride</button>

              <button
                type="button"
                onClick={scrollToWallet}
                style={{
                  background: "#ffffff",
                  color: "#111318",
                  border: "1px solid #ffc400",
                }}
              >
                💰 Wallet ₹{money(customerWalletBalance)}
              </button>
            </div>
          </div>
          <div className="cvMountains" aria-hidden="true" />
        </section>

        <section className="cvOverview">
          <article className="cvActiveRide">
            <header>
              <h2>Your Active Ride</h2>
              <span className={activeRide ? "live" : "idle"}>
                ● {activeRide ? "Live" : "No active ride"}
              </span>
            </header>

            {activeRide ? (
              <>
                <div className="cvRideBody">
                  <div className="cvRouteInfo">
                    <div className="cvStop pickup">
                      <i />
                      <span>
                        Pickup
                        <strong>{pickupOf(activeRide)}</strong>
                      </span>
                    </div>

                    <div className="cvStop drop">
                      <i />
                      <span>
                        Drop
                        <strong>{dropOf(activeRide)}</strong>
                      </span>
                    </div>

                    <div className="cvRideNumbers">
                      <span>
                        Fare
                        <strong>
                          {fareOf(activeRide) > 0 ? (
                            <>
                              ₹{money(fareOf(activeRide))}
                              {activeRide.fareStatus === "fare_accepted" && (
                                <small
                                  style={{
                                    color: "#22c55e",
                                    marginLeft: 4,
                                  }}
                                >
                                  🔒 Locked
                                </small>
                              )}
                            </>
                          ) : (
                            "Waiting for driver"
                          )}
                        </strong>
                      </span>
                      <span>
                        Distance
                        <strong>
                          {distanceOf(activeRide)
                            ? `${distanceOf(activeRide).toFixed(1)} km`
                            : "—"}
                        </strong>
                      </span>
                      <span>
                        Status
                        <strong>{statusText(activeRide.status)}</strong>
                      </span>
                    </div>

                    {/* Fare Negotiation UI */}
                    <FareNegotiationUI
                      ride={activeRide}
                      onAccept={handleFareAccept}
                      onCounter={handleFareCounter}
                      onReject={handleFareReject}
                    />
                  </div>

                  <div className="cvDriverInfo">
                    <div className="cvDriverHead">
                      <span className="cvDriverPhoto">
                        {driverPhoto ? (
                          <img src={driverPhoto} alt={driverName} />
                        ) : (
                          initials(driverName)
                        )}
                      </span>
                      <div>
                        <strong>{driverName}</strong>
                        <small>
                          ⭐{" "}
                          {driver?.driverProfile?.rating || driver?.rating || "5.0"}
                        </small>
                      </div>
                    </div>
                    <p>{vehicleNumber}</p>
                    <p>{vehicleName}</p>
                    <b className="cvStatusPill">● {statusText(activeRide.status)}</b>
                  </div>
                </div>

                <div className="cvRideActions">
                  <button
                    disabled={!driverPhone}
                    onClick={() => {
                      if (driverPhone) window.location.href = `tel:${driverPhone}`;
                    }}
                  >
                    ☎ Call Driver
                  </button>

                  <button
                    disabled={!driverPhone}
                    onClick={() => {
                      if (!driverPhone) return;

                      const message = encodeURIComponent(
                        `Namaste, main HimRideG booking ${activeRide?.bookingNumber || idOf(activeRide) || ""} ke baare mein message kar raha/rahi hoon.`
                      );

                      window.location.href = `sms:${driverPhone}?body=${message}`;
                    }}
                    title={driverPhone ? "Message driver" : "Driver number abhi available nahi hai"}
                  >
                    ▤ Message
                  </button>

                  {/* Manual Payment Button — ride complete hone pe */}
                  {activeRide.status === "completed" &&
                    fareOf(activeRide) > 0 &&
                    activeRide.paymentStatus !== "paid" &&
                    !paidBookingIds.has(idOf(activeRide)) && (
                      <button
                        className="payNowBtn"
                        style={{
                          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                          color: "#000",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: 10,
                          padding: "10px 16px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setPaymentBooking(activeRide);
                          setShowPaymentModal(true);
                        }}
                      >
                        💳 Pay Now ₹{money(fareOf(activeRide))}
                      </button>
                    )}

                  {canCancel && (
                    <button className="danger" onClick={cancelActiveRide}>
                      Cancel Ride
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="cvEmpty">
                <span>🚕</span>
                <h3>Abhi koi active ride nahi hai</h3>
                <p>Pickup aur destination select karke ride book karein.</p>
                <button onClick={openBookRide}>Book a Ride</button>
              </div>
            )}
          </article>

          <article className="cvLiveMap">
            <header>
              <h2>Live Route</h2>
              <span>{activeRide ? statusText(activeRide.status) : "Ready"}</span>
            </header>

            <div className="cvMapFrame">
              <RideMap
                key={activeRide ? idOf(activeRide) : "booking-map"}
                onLocationChange={() => {}}
                onAddressChange={() => {}}
                pickupAddress={
                  activeRide
                    ? pickupOf(activeRide)
                    : booking.pickup
                }
                dropAddress={
                  activeRide
                    ? dropOf(activeRide)
                    : booking.dropoff
                }
                pickupCoordinates={
                  activeRide?.pickup?.coordinates ||
                  activeRide?.pickupCoordinates ||
                  mapData?.pickup ||
                  null
                }
                dropCoordinates={
                  activeRide?.dropoff?.coordinates ||
                  activeRide?.drop?.coordinates ||
                  activeRide?.dropCoordinates ||
                  mapData?.drop ||
                  null
                }
                driverLocation={driverLocation}
                readOnly={Boolean(activeRide)}
              />
            </div>

            <footer>
              <span><i className="green" />Pickup</span>
              <span><i className="red" />Destination</span>
              {driverLocation && (
                <span style={{ color: "#3b82f6" }}>
                  <i style={{ background: "#3b82f6" }} />Driver Live
                </span>
              )}
            </footer>
          </article>

          <aside className="cvStats">
            <button onClick={() => scrollToRides("active")}>
              <i>🚕</i>
              <span>
                Total Rides
                <strong>{localBookings.length}</strong>
                <small>View all →</small>
              </span>
            </button>

            <button onClick={() => scrollToRides("scheduled")}>
              <i>📅</i>
              <span>
                Upcoming
                <strong>{scheduledRides.length}</strong>
                <small>View all →</small>
              </span>
            </button>

            <button onClick={() => scrollToRides("completed")}>
              <i>✓</i>
              <span>
                Completed
                <strong>{completedRides.length}</strong>
                <small>View all →</small>
              </span>
            </button>
          </aside>
        </section>

        <section
          id="customer-wallet"
          style={{
            marginTop: 20,
            padding: "22px 26px",
            display: "grid",
            gridTemplateColumns: "minmax(220px, 0.7fr) minmax(280px, 1.3fr)",
            gap: 18,
            alignItems: "stretch",
            background: "#ffffff",
            color: "#111318",
            border: "1px solid #dfe3e8",
            borderRadius: 13,
            boxShadow: "0 14px 35px rgba(0,0,0,.22)",
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: "linear-gradient(135deg, #ffc400, #ffe889)",
              color: "#111318",
            }}
          >
            <small style={{ fontWeight: 800 }}>HimRideG Customer Wallet</small>
            <div
              style={{
                marginTop: 8,
                fontSize: "clamp(30px, 4vw, 46px)",
                fontWeight: 950,
                lineHeight: 1,
              }}
            >
              ₹{money(customerWalletBalance)}
            </div>
            <p style={{ margin: "9px 0 0", fontSize: 13 }}>Available balance</p>
          </div>

          <div
            style={{
              padding: "4px 2px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h2 style={{ margin: "0 0 8px" }}>Wallet</h2>
            <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
              Aapka HimRideG wallet balance yahan hamesha visible rahega. Ride
              refund ya wallet credit aane par updated balance isi section me
              dikhega.
            </p>
            <small style={{ marginTop: 12, color: "#9ca3af" }}>
              Wallet se related driver commission details customer ko show nahi
              ki jaati.
            </small>
          </div>
        </section>

        <section className="cvMyRides" id="customer-rides">
          <header>
            <div>
              <h2>My Rides</h2>
              <nav>
                {["active", "scheduled", "completed"].map((tab) => (
                  <button
                    key={tab}
                    className={rideTab === tab ? "active" : ""}
                    onClick={() => setRideTab(tab)}
                  >
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            <button onClick={loadBookings}>↻ Refresh</button>
          </header>

          <div className="cvRideList">
            {!tabRides.length ? (
              <div className="cvNoRides">Is list mein abhi koi ride nahi hai.</div>
            ) : (
              tabRides.map((ride) => (
                <article key={idOf(ride)}>
                  <time>
                    <strong>
                      {String(dateOf(ride).getDate()).padStart(2, "0")}
                    </strong>
                    <span>
                      {dateOf(ride).toLocaleString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </time>

                  <div>
                    <small>Pickup</small>
                    <strong>{pickupOf(ride)}</strong>
                  </div>

                  <b className="cvArrow">→</b>

                  <div>
                    <small>Drop</small>
                    <strong>{dropOf(ride)}</strong>
                  </div>

                  <div>
                    <small>Date & Time</small>
                    <strong>
                      {dateOf(ride).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </strong>
                  </div>

                  <div>
                    <small>Fare</small>
                    <strong>
                      {fareOf(ride) > 0
                        ? `₹${money(fareOf(ride))}`
                        : "Waiting for driver"}
                    </strong>
                  </div>

                  <div>
                    <small>Distance</small>
                    <strong>
                      {distanceOf(ride)
                        ? `${distanceOf(ride).toFixed(1)} km`
                        : "—"}
                    </strong>
                  </div>

                  <span className={`cvRideStatus ${ride.status}`}>
                    {statusText(ride.status)}
                  </span>

                  {/* Pay button in ride list */}
                  {ride.status === "completed" &&
                    fareOf(ride) > 0 &&
                    ride.paymentStatus !== "paid" &&
                    !paidBookingIds.has(idOf(ride)) && (
                      <button
                        style={{
                          background: "#fbbf24",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer",
                          color: "#000",
                        }}
                        onClick={() => {
                          setPaymentBooking(ride);
                          setShowPaymentModal(true);
                        }}
                      >
                        💳 Pay
                      </button>
                    )}

                  {ride.status === "completed" && ride.paymentStatus === "paid" && (
                    <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>
                      ✅ Paid
                    </span>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <CustomerBookRide
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        booking={booking}
        setBooking={setBooking}
        mapData={mapData}
        setMapData={setMapData}
        createBooking={createBookingAndReturnToDashboard}
        activeRide={activeRide}
        driverLocation={driverLocation}
      />

      {profileOpen && (
        <div
          className="cvProfileShade"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfileOpen(false);
          }}
        >
          <aside className="cvProfilePanel">
            <button className="cvProfileClose" onClick={() => setProfileOpen(false)}>
              ×
            </button>

            <div className="cvProfilePhotoWrap">
              <span className="cvProfilePhoto">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} />
                ) : (
                  initials(profile.name)
                )}
              </span>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={choosePhoto}
              />
              <small>Change Photo</small>
            </div>

            <form onSubmit={saveProfile}>
              <h2>Edit Profile</h2>

              <label>
                Full Name
                <input
                  value={profile.name}
                  maxLength="100"
                  required
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </label>

              <label>
                Primary Mobile Number
                <div className="cvVerifiedInput">
                  <input value={profile.phone} readOnly />
                  <span>Verified ✓</span>
                </div>
              </label>

              <label>
                Alternative Mobile Number
                <input
                  type="tel"
                  maxLength="15"
                  value={profile.alternativePhone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      alternativePhone: e.target.value.replace(/[^0-9+]/g, ""),
                    })
                  }
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  maxLength="150"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </label>

              {profileMessage && (
                <p className="cvProfileMessage">{profileMessage}</p>
              )}

              <button className="cvSaveProfile" disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="cvCancelProfile"
                type="button"
                onClick={() => setProfileOpen(false)}
              >
                Cancel
              </button>

              <button className="cvProfileLogout" type="button" onClick={logout}>
                Logout
              </button>
            </form>
          </aside>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentBooking(null);
          }}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingRide && (
        <RatingModal
          ride={ratingRide}
          onSubmit={handleRatingSubmit}
          onSkip={handleRatingSkip}
        />
      )}
    </div>
  );
}

export default CustomerDashboard;