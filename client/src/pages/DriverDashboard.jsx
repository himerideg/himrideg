import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import api, { apiBaseUrl } from "../api";
import socket from "../socket";
import { playHimRideGEventSound, playHimRideGSound } from "../utils/himridegSounds";

import DriverLocationTracker from "../DriverLocationTracker";
import DriverRideMap from "../DriverRideMap";
import DriverWarnings from "../components/DriverWarnings";
import DriverPaymentModal from "../components/DriverPaymentModal";

import "../driver-dashboard.css";
import "../payment-modal.css";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const DEFAULT_CENTER = [
  32.1109,
  76.5363
];

const ACTIVE_RIDE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

const LOCATION_TRACKING_STATUSES = [
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

const DRIVER_DOCUMENT_TYPES = [
  ["aadhaar", "Aadhaar Card"],
  ["driving_license", "Driving Licence"],
  ["vehicle_rc", "Vehicle RC"],
  ["insurance", "Vehicle Insurance"],
  ["pollution_certificate", "Pollution Certificate"],
  ["permit", "Commercial Permit"],
  ["fitness_certificate", "Fitness Certificate"],
  ["vehicle_photo", "Vehicle Photo"]
];

/* ADD-ONLY: old records remain compatible, but these are no longer driver-facing requirements. */
const HIDDEN_DRIVER_DOCUMENT_TYPES = new Set([
  "insurance",
  "pollution_certificate",
  "fitness_certificate"
]);

const STATUS_LABELS = {
  pending: "Pending",
  searching_driver: "Searching Driver",
  driver_assigned: "Driver Assigned",
  accepted: "Accepted — Fare bhejo",
  fare_offered: "Fare Offer Sent",
  negotiating: "Fare Negotiation",
  fare_accepted: "Fare Locked",
  driver_arriving: "Going to Pickup",
  driver_arrived: "Arrived",
  started: "Ride Started",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired"
};

/*
|--------------------------------------------------------------------------
| Leaflet Icons
|--------------------------------------------------------------------------
*/

const pickupIcon = L.divIcon({
  className: "driverMapCustomIcon",

  html:
    '<div class="driverMapPin pickupPin"><span>P</span></div>',

  iconSize: [
    38,
    38
  ],

  iconAnchor: [
    19,
    38
  ]
});

const dropIcon = L.divIcon({
  className: "driverMapCustomIcon",

  html:
    '<div class="driverMapPin dropPin"><span>D</span></div>',

  iconSize: [
    38,
    38
  ],

  iconAnchor: [
    19,
    38
  ]
});

const driverIcon = L.divIcon({
  className: "driverMapCustomIcon",

  html:
    '<div class="driverMapPin driverPin"><span>🚕</span></div>',

  iconSize: [
    42,
    42
  ],

  iconAnchor: [
    21,
    42
  ]
});

/*
|--------------------------------------------------------------------------
| General Helpers
|--------------------------------------------------------------------------
*/

function getStoredToken() {
  const possibleKeys = [
    "token",
    "accessToken",
    "authToken",
    "himridegToken",
    "himrideg_token"
  ];

  for (const key of possibleKeys) {
    const value =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (value) {
      return value.replace(
        /^Bearer\s+/i,
        ""
      );
    }
  }

  try {
    const authData = JSON.parse(
      localStorage.getItem("auth") ||
        localStorage.getItem("user") ||
        localStorage.getItem("himrideg_user") ||
        sessionStorage.getItem("auth") ||
        sessionStorage.getItem("user") ||
        "{}"
    );

    const token =
      authData?.token ||
      authData?.accessToken ||
      authData?.authToken;

    return token
      ? String(token).replace(
          /^Bearer\s+/i,
          ""
        )
      : "";
  } catch (error) {
    return "";
  }
}

function getId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        value.userId ||
        value.bookingId ||
        ""
    );
  }

  return String(value);
}

function getAssignedDriverId(ride) {
  return getId(
    ride?.driver ||
      ride?.driverId ||
      ride?.assignedDriver
  );
}

function getCustomer(ride) {
  if (
    ride?.customer &&
    typeof ride.customer === "object"
  ) {
    return ride.customer;
  }

  return {};
}

function getPickupName(ride) {
  return (
    ride?.pickup?.address ||
    ride?.pickup?.name ||
    ride?.pickup?.formattedAddress ||
    ride?.pickupAddress ||
    (
      typeof ride?.pickup === "string"
        ? ride.pickup
        : ""
    ) ||
    "Pickup location"
  );
}

function getDropName(ride) {
  return (
    ride?.dropoff?.address ||
    ride?.dropoff?.name ||
    ride?.dropoff?.formattedAddress ||
    ride?.drop?.address ||
    ride?.drop?.name ||
    ride?.dropAddress ||
    (
      typeof ride?.dropoff === "string"
        ? ride.dropoff
        : ""
    ) ||
    (
      typeof ride?.drop === "string"
        ? ride.drop
        : ""
    ) ||
    "Drop location"
  );
}

function getCoordinateObject(location) {
  if (!location) {
    return null;
  }

  if (
    location.coordinates &&
    typeof location.coordinates ===
      "object"
  ) {
    return location.coordinates;
  }

  return location;
}

function getCoordinates(value) {
  if (!value) {
    return null;
  }

  if (
    Array.isArray(value) &&
    value.length >= 2
  ) {
    const first =
      Number(value[0]);

    const second =
      Number(value[1]);

    if (
      Number.isFinite(first) &&
      Number.isFinite(second)
    ) {
      /*
      |--------------------------------------------------------------------------
      | Most frontend arrays use [latitude, longitude].
      |--------------------------------------------------------------------------
      */

      if (
        Math.abs(first) <= 90 &&
        Math.abs(second) <= 180
      ) {
        return [
          first,
          second
        ];
      }
    }
  }

  const coordinateObject =
    getCoordinateObject(value);

  const latitude =
    Number(
      coordinateObject?.latitude ??
        coordinateObject?.lat
    );

  const longitude =
    Number(
      coordinateObject?.longitude ??
        coordinateObject?.lng ??
        coordinateObject?.lon
    );

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return [
      latitude,
      longitude
    ];
  }

  const geo =
    coordinateObject?.geo ||
    value?.geo;

  if (
    geo?.type === "Point" &&
    Array.isArray(
      geo.coordinates
    ) &&
    geo.coordinates.length >= 2
  ) {
    const geoLongitude =
      Number(
        geo.coordinates[0]
      );

    const geoLatitude =
      Number(
        geo.coordinates[1]
      );

    if (
      Number.isFinite(
        geoLatitude
      ) &&
      Number.isFinite(
        geoLongitude
      )
    ) {
      return [
        geoLatitude,
        geoLongitude
      ];
    }
  }

  return null;
}

function getPickupCoordinates(ride) {
  return getCoordinates(
    ride?.pickupCoordinates ||
      ride?.pickup?.coordinates ||
      ride?.pickup?.location ||
      ride?.pickup
  );
}

function getDropCoordinates(ride) {
  return getCoordinates(
    ride?.dropCoordinates ||
      ride?.dropoff?.coordinates ||
      ride?.drop?.coordinates ||
      ride?.dropoff?.location ||
      ride?.drop?.location ||
      ride?.dropoff ||
      ride?.drop
  );
}

function getEstimatedFare(ride) {
  const fare =
    ride?.fare?.estimatedFare ??
    ride?.fare?.totalFare ??
    ride?.estimatedFare ??
    ride?.totalFare ??
    0;

  const numericFare =
    Number(fare);

  return Number.isFinite(
    numericFare
  )
    ? numericFare
    : 0;
}

function getFinalFare(ride) {
  const fare =
    ride?.finalFare ??
    ride?.fare?.finalFare ??
    ride?.driverOfferedFare ??
    ride?.customerCounterFare ??
    0;

  const numericFare = Number(fare);

  return Number.isFinite(numericFare)
    ? numericFare
    : 0;
}

/*
|--------------------------------------------------------------------------
| Payment-aware Driver Ride State
|--------------------------------------------------------------------------
|
| Backend ride `status` physical trip complete hote hi `completed` hota hai.
| Driver UI me final Completed tab/count tabhi maana jayega jab payment paid ho.
| Isse customer payment pending phase clearly `Waiting for Payment` dikhega.
|
*/
function getRidePaymentStatus(ride) {
  return String(
    ride?.paymentStatus ??
      ride?.payment?.status ??
      "pending"
  )
    .trim()
    .toLowerCase();
}

function isRidePaymentPaid(ride) {
  return ["paid", "completed"].includes(
    getRidePaymentStatus(ride)
  );
}

function getLockedFinalFare(ride) {
  const value = Number(
    ride?.finalFare ??
      ride?.fare?.finalFare ??
      0
  );

  return Number.isFinite(value) ? value : 0;
}

function isFinalFareLocked(ride) {
  return Boolean(
    ride &&
      ride.fareStatus === "fare_accepted" &&
      getLockedFinalFare(ride) > 0
  );
}

function getPaymentPlan(ride) {
  const explicit = String(ride?.paymentPlan || "").trim();

  if (["online_after_ride", "advance", "scheduled"].includes(explicit)) {
    return explicit;
  }

  if (ride?.paymentTiming === "pay_now") {
    return "advance";
  }

  return null;
}

function isAdvancePaymentPending(ride) {
  return (
    getPaymentPlan(ride) === "advance" &&
    !isRidePaymentPaid(ride)
  );
}

/*
|--------------------------------------------------------------------------
| Driver Action Gate
|--------------------------------------------------------------------------
| Incoming request ke Accept/Reject aur fare-negotiation controls exception
| hain. Assigned ride ke pickup/arrive/OTP/start/complete actions tabhi enable
| honge jab final fare locked ho. Advance plan ho to payment paid bhi required.
|--------------------------------------------------------------------------
*/
function canUseDriverRideActions(ride) {
  if (!isFinalFareLocked(ride)) {
    return false;
  }

  /*
  | Legacy advance-payment data preserve hai. Latest rule me customer payment
  | ride complete hone se pehle required nahi hai, isliye driver actions lock
  | nahi honge.
  */
  if (false && isAdvancePaymentPending(ride)) {
    return false;
  }

  return true;
}

function isWaitingForPaymentRide(ride) {
  return (
    ride?.status === "completed" &&
    !isRidePaymentPaid(ride)
  );
}

const LEGACY_CASH_CONFIRMATION_CUTOFF =
  Date.parse("2026-08-23T07:30:00.000Z");

function isLegacyCashPendingRide(ride) {
  if (!ride || !isWaitingForPaymentRide(ride)) {
    return false;
  }

  if (
    String(ride?.paymentMethod || ride?.payment?.method || "")
      .trim()
      .toLowerCase() !== "cash"
  ) {
    return false;
  }

  if (
    ride?.cashSelectedAt ||
    String(ride?.paymentChoiceAfterRide || ride?.payment?.choiceAfterRide || "").trim()
  ) {
    return false;
  }

  const legacyTimestamp = new Date(
    ride?.completedAt ||
      ride?.updatedAt ||
      ride?.createdAt ||
      0
  ).getTime();

  return (
    Number.isFinite(legacyTimestamp) &&
    legacyTimestamp > 0 &&
    legacyTimestamp <= LEGACY_CASH_CONFIRMATION_CUTOFF
  );
}

function canConfirmCashForRide(ride) {
  /*
  |--------------------------------------------------------------------------
  | Driver Receive Cash Availability
  |--------------------------------------------------------------------------
  | FINAL CASH RULE:
  | - Ride physically complete hote hi driver ko Receive Cash action milega.
  | - Customer ka Cash Payment tap sirf customer intent / realtime hint hai;
  |   driver action ko unlock karne ke liye mandatory nahi hai.
  | - Online payment successful hote hi isWaitingForPaymentRide false ho jata
  |   hai, isliye Receive Cash action automatically disappear ho jayega.
  |--------------------------------------------------------------------------
  */
  return Boolean(
    isWaitingForPaymentRide(ride) &&
      !isRidePaymentPaid(ride)
  );
}

/*
|--------------------------------------------------------------------------
| Cash Selection State
|--------------------------------------------------------------------------
| paymentMethod ka default legacy value cash ho sakta hai, isliye sirf us
| field par depend nahi karte. Customer ki actual post-ride cash selection
| cashSelectedAt ya paymentChoiceAfterRide se confirm hoti hai.
|--------------------------------------------------------------------------
*/
function isCashSelectedForRide(ride) {
  return Boolean(
    ride?.cashSelectedAt ||
      String(
        ride?.paymentChoiceAfterRide ||
          ride?.payment?.choiceAfterRide ||
          ""
      )
        .trim()
        .toLowerCase() === "cash"
  );
}

function isFinalCompletedRide(ride) {
  return (
    ride?.status === "completed" &&
    isRidePaymentPaid(ride)
  );
}

function getDriverRideStatusLabel(ride) {
  if (isWaitingForPaymentRide(ride)) {
    return "Waiting for Payment";
  }

  return (
    STATUS_LABELS[ride?.status] ||
    ride?.status ||
    "Unknown"
  );
}

function getCommissionPercent(ride) {
  const percent = Number(
    ride?.platformCommissionPercent ?? 10
  );

  return Number.isFinite(percent) && percent >= 0
    ? percent
    : 10;
}

function getCommissionAmount(ride) {
  const saved = Number(
    ride?.platformCommissionAmount
  );

  if (Number.isFinite(saved) && saved >= 0) {
    return saved;
  }

  return Math.round(
    getFinalFare(ride) *
      getCommissionPercent(ride)
  ) / 100;
}

function getDriverPayable(ride) {
  const saved = Number(
    ride?.driverPayableAmount
  );

  if (Number.isFinite(saved) && saved >= 0) {
    return saved;
  }

  return Math.max(
    0,
    getFinalFare(ride) -
      getCommissionAmount(ride)
  );
}

function getDistance(ride) {
  const distance =
    ride?.distanceKm ??
    ride?.estimatedDistanceKm ??
    ride?.distance ??
    ride?.route?.distanceKm ??
    0;

  const numericDistance =
    Number(distance);

  return Number.isFinite(
    numericDistance
  )
    ? numericDistance
    : 0;
}

function getCustomerPhone(ride) {
  const customer =
    getCustomer(ride);

  return (
    customer?.phone ||
    ride?.customerPhone ||
    "Not available"
  );
}

function getCustomerName(ride) {
  const customer =
    getCustomer(ride);

  return (
    customer?.name ||
    ride?.customerName ||
    "Customer"
  );
}

function getPassengerCount(ride) {
  return (
    Number(
      ride?.passengers ||
        ride?.passengerCount
    ) || 1
  );
}

function getRideNote(ride) {
  return (
    ride?.note ||
    ride?.customerNote ||
    ride?.specialInstructions ||
    ""
  );
}

function formatDate(date) {
  if (!date) {
    return "Date available nahi hai";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Date available nahi hai";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function formatDistance(distance) {
  const numericDistance =
    Number(distance);

  if (
    !Number.isFinite(
      numericDistance
    ) ||
    numericDistance <= 0
  ) {
    return "Not available";
  }

  return `${numericDistance.toFixed(
    1
  )} km`;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.message ||
    "Request complete nahi hui"
  );
}

function extractBooking(payload) {
  return (
    payload?.data?.booking ||
    payload?.booking ||
    payload?.data?.data?.booking ||
    null
  );
}

function getRequestExpiry(
  payload
) {
  return (
    payload?.data?.expiresAt ||
    payload?.data
      ?.dispatchExpiresAt ||
    payload?.expiresAt ||
    payload?.dispatchExpiresAt ||
    payload?.metadata
      ?.dispatchExpiresAt ||
    null
  );
}

function isDriverApproved(user) {
  /*
  |--------------------------------------------------------------------------
  | Canonical Driver Approval — ADD-ONLY FIX
  |--------------------------------------------------------------------------
  | Dashboard, onboarding aur ride-feed sab same admin approval meaning use
  | karein. approvalStatus=approved ko bhi authoritative signal maana gaya.
  */

  return Boolean(
    user?.approved === true ||
      user?.isApproved === true ||
      user?.driverProfile
        ?.isApproved === true ||
      String(
        user?.driverProfile
          ?.approvalStatus ||
          ""
      )
        .trim()
        .toLowerCase() ===
        "approved" ||
      (
        user?.driverProfile
          ?.approvedAt &&
        user?.driverProfile
          ?.approvedBy
      )
  );
}

/*
|--------------------------------------------------------------------------
| Map Bounds
|--------------------------------------------------------------------------
*/

function FitMapBounds({
  pickupPosition,
  dropPosition,
  driverPosition
}) {
  const map = useMap();

  useEffect(() => {
    const positions = [
      pickupPosition,
      dropPosition,
      driverPosition
    ].filter(Boolean);

    if (
      positions.length === 0
    ) {
      return;
    }

    if (
      positions.length === 1
    ) {
      map.setView(
        positions[0],
        14
      );

      return;
    }

    map.fitBounds(
      positions,
      {
        padding: [
          45,
          45
        ],

        maxZoom: 15
      }
    );
  }, [
    map,
    pickupPosition,
    dropPosition,
    driverPosition
  ]);

  return null;
}

/*
|--------------------------------------------------------------------------
| Ride Map
|--------------------------------------------------------------------------
*/

function LegacyDriverRideMap({
  ride
}) {
  const [
    driverPosition,
    setDriverPosition
  ] = useState(null);

  const [
    locationError,
    setLocationError
  ] = useState("");

  const pickupPosition =
    useMemo(
      () =>
        getPickupCoordinates(
          ride
        ),
      [ride]
    );

  const dropPosition =
    useMemo(
      () =>
        getDropCoordinates(
          ride
        ),
      [ride]
    );

  useEffect(() => {
    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Browser location support nahi karta."
      );

      return undefined;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setDriverPosition([
            position.coords
              .latitude,

            position.coords
              .longitude
          ]);

          setLocationError("");
        },

        (error) => {
          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setLocationError(
              "Driver location permission allow karo."
            );
          } else {
            setLocationError(
              "Current location nahi mil paayi."
            );
          }
        },

        {
          enableHighAccuracy:
            true,

          timeout: 15000,

          maximumAge: 5000
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, []);

  const mapCenter =
    driverPosition ||
    pickupPosition ||
    dropPosition ||
    DEFAULT_CENTER;

  const routePositions = [
    pickupPosition,
    dropPosition
  ].filter(Boolean);

  if (
    !pickupPosition &&
    !dropPosition
  ) {
    return (
      <div className="driverMapUnavailable">
        <strong>
          Map location available nahi hai
        </strong>

        <p>
          Is booking me pickup aur drop
          coordinates save nahi hue hain.
        </p>
      </div>
    );
  }

  return (
    <div className="driverRideMapWrapper">
      <div className="driverMapHeader">
        <div>
          <small>
            RIDE ROUTE
          </small>

          <strong>
            Pickup aur Drop Map
          </strong>
        </div>

        <span>
          {driverPosition
            ? "Live location active"
            : "Location loading..."}
        </span>
      </div>

      {locationError && (
        <div className="driverMapLocationError">
          {locationError}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom
        className="driverRideMap"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapBounds
          pickupPosition={
            pickupPosition
          }
          dropPosition={
            dropPosition
          }
          driverPosition={
            driverPosition
          }
        />

        {pickupPosition && (
          <Marker
            position={
              pickupPosition
            }
            icon={pickupIcon}
          >
            <Popup>
              <strong>
                Pickup
              </strong>

              <br />

              {getPickupName(
                ride
              )}
            </Popup>
          </Marker>
        )}

        {dropPosition && (
          <Marker
            position={
              dropPosition
            }
            icon={dropIcon}
          >
            <Popup>
              <strong>
                Drop
              </strong>

              <br />

              {getDropName(
                ride
              )}
            </Popup>
          </Marker>
        )}

        {driverPosition && (
          <Marker
            position={
              driverPosition
            }
            icon={driverIcon}
          >
            <Popup>
              <strong>
                Driver current location
              </strong>
            </Popup>
          </Marker>
        )}

        {routePositions.length ===
          2 && (
          <Polyline
            positions={
              routePositions
            }
            pathOptions={{
              color: "#f5b700",
              weight: 5,
              opacity: 0.9,
              dashArray: "9 8"
            }}
          />
        )}
      </MapContainer>

      <div className="driverMapLegend">
        <span>
          <i className="legendPickup" />
          Pickup
        </span>

        <span>
          <i className="legendDrop" />
          Drop
        </span>

        <span>
          <i className="legendDriver" />
          Driver
        </span>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Main Dashboard
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Google Maps Navigation Helper
|--------------------------------------------------------------------------
*/

function createNavigationUrl(coordinates) {
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    return "#";
  }

  const latitude = Number(coordinates[0]);
  const longitude = Number(coordinates[1]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return "#";
  }

  const destination =
    encodeURIComponent(
      `${latitude},${longitude}`
    );

  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${destination}` +
    "&travelmode=driving"
  );
}


/* ==========================================================================
   Razorpay Checkout Loader
   ========================================================================== */
function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Razorpay checkout load nahi hua")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Razorpay checkout load nahi hua"));

    document.body.appendChild(script);
  });
}

/* ==========================================================================
   Wallet Top-up Component
   ========================================================================== */
function WalletTopupForm({ onSuccess }) {
  const [amount, setAmount] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState({ text: "", type: "" });

  const startTopup = async () => {
    const topupAmount = Math.round(Number(amount || 0));

    if (
      !Number.isFinite(topupAmount) ||
      topupAmount < 100 ||
      topupAmount > 50000
    ) {
      setMsg({
        text: "Top-up ₹100 se ₹50,000 ke beech rakho.",
        type: "error"
      });
      return;
    }

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      await loadRazorpayCheckout();

      const { data } = await api.post(
        "/wallet/topup/create-order",
        { amount: topupAmount }
      );

      const order = data?.data || data || {};

      if (!order?.keyId || !order?.orderId) {
        throw new Error("Wallet top-up order details incomplete hain");
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "HimRideG",
        description: "Driver Wallet Top-up",
        order_id: order.orderId,
        prefill: {
          name: order.driverName || "Driver",
          contact: order.driverPhone || ""
        },
        theme: {
          color: "#f5c518"
        },
        handler: async (response) => {
          try {
            const verify = await api.post(
              "/wallet/topup/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: topupAmount
              }
            );

            setMsg({
              text:
                verify?.data?.message ||
                "Wallet top-up successful",
              type: "success"
            });

            setAmount("");
            onSuccess?.(verify?.data?.data);
          } catch (error) {
            setMsg({
              text:
                error?.response?.data?.message ||
                error?.message ||
                "Top-up verify nahi hua",
              type: "error"
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      });

      razorpay.on("payment.failed", (response) => {
        setLoading(false);

        setMsg({
          text:
            response?.error?.description ||
            "Wallet payment fail ho gayi",
          type: "error"
        });
      });

      razorpay.open();
    } catch (error) {
      setLoading(false);

      setMsg({
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Wallet top-up start nahi hua",
        type: "error"
      });
    }
  };

  return (
    <div className="withdrawalFormWrap driverWalletTopupForm">
      <div className="withdrawalFields">
        <input
          type="number"
          min={100}
          max={50000}
          value={amount}
          onChange={(event) =>
            setAmount(event.target.value)
          }
          placeholder="Add Money amount (₹100 - ₹50,000)"
        />
      </div>

      {msg.text && (
        <p className={`withdrawalMsg ${msg.type}`}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        className="withdrawalSubmitBtn"
        onClick={startTopup}
        disabled={loading}
      >
        {loading
          ? "Payment open ho rahi hai..."
          : "＋ Add Money to Wallet"}
      </button>
    </div>
  );
}

/* ==========================================================================
   Withdrawal Form Component
   ========================================================================== */
function WithdrawalForm({ balance, onSuccess }) {
  const [method, setMethod] = React.useState("upi");
  const [amount, setAmount] = React.useState("");
  const [upiId, setUpiId] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState({ text: "", type: "" });

  const handleSubmit = async () => {
    setMsg({ text: "", type: "" });
    const amt = Number(amount);
    if (!amt || amt < 100) {
      setMsg({ text: "Minimum \u20b9100 withdrawal hai.", type: "error" });
      return;
    }
    if (amt > balance) {
      setMsg({ text: `Balance sirf \u20b9${balance.toFixed(0)} hai.`, type: "error" });
      return;
    }
    if (method === "upi" && !upiId.trim()) {
      setMsg({ text: "UPI ID enter karo.", type: "error" });
      return;
    }
    if (method === "bank" && (!accountNumber.trim() || !ifsc.trim())) {
      setMsg({ text: "Account number aur IFSC zaroori hai.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        amount: amt,
        upiId: method === "upi" ? upiId.trim() : "",
        bankName: method === "bank" ? bankName.trim() : "",
        accountNumber: method === "bank" ? accountNumber.trim() : "",
        ifsc: method === "bank" ? ifsc.trim() : ""
      };
      const { data } = await api.post("/driver/withdrawal", payload);
      setMsg({ text: data?.message || "Request submit ho gayi!", type: "success" });
      setAmount(""); setUpiId(""); setBankName(""); setAccountNumber(""); setIfsc("");
      if (onSuccess) onSuccess();
    } catch (error) {
      setMsg({ text: error?.response?.data?.message || "Request submit nahi ho saki.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="withdrawalFormWrap">
      <div className="withdrawalMethodTabs">
        <button type="button" className={method === "upi" ? "active" : ""} onClick={() => setMethod("upi")}>UPI</button>
        <button type="button" className={method === "bank" ? "active" : ""} onClick={() => setMethod("bank")}>Bank Transfer</button>
      </div>
      <div className="withdrawalFields">
        <input type="number" placeholder={`Amount (min \u20b9100, max \u20b9${balance.toFixed(0)})`} value={amount} min={100} max={balance} onChange={e => setAmount(e.target.value)} />
        {method === "upi" && (
          <input type="text" placeholder="UPI ID (e.g. name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} />
        )}
        {method === "bank" && (<>
          <input type="text" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />
          <input type="text" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
          <input type="text" placeholder="IFSC Code" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} />
        </>)}
      </div>
      {msg.text && <p className={`withdrawalMsg ${msg.type}`}>{msg.text}</p>}
      <button type="button" className="withdrawalSubmitBtn" onClick={handleSubmit} disabled={submitting || balance < 100}>
        {submitting ? "Submit ho raha hai..." : "Withdrawal Request Bhejo"}
      </button>
      {balance < 100 && <p className="withdrawalMsg error">Minimum \u20b9100 balance chahiye.</p>}
    </div>
  );
}


/* ==========================================================================
   ADD-ONLY: Real RazorpayX Instant + Scheduled Payout
   Legacy admin withdrawal form above remains untouched.
   ========================================================================== */
function InstantPayoutForm({ balance, walletData, onSuccess }) {
  const saved = walletData?.savedPayout || {};
  const settings = walletData?.payoutSettings || {};
  const [method, setMethod] = React.useState(saved.preferredMethod || "upi");
  const [amount, setAmount] = React.useState("");
  const [upiId, setUpiId] = React.useState(saved.upiId || "");
  const [bankName, setBankName] = React.useState(saved.bankName || "");
  const [accountHolderName, setAccountHolderName] = React.useState(saved.accountHolderName || "");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifsc, setIfsc] = React.useState(saved.ifsc || "");
  const [autoEnabled, setAutoEnabled] = React.useState(Boolean(settings.autoPayoutEnabled));
  const [frequency, setFrequency] = React.useState(settings.autoPayoutFrequency || "weekly");
  const [autoMinimum, setAutoMinimum] = React.useState(String(settings.autoPayoutMinimum || 500));
  const [submitting, setSubmitting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState({ text: "", type: "" });
  const savedUpiReady = Boolean(String(saved.upiId || "").trim());
  const savedBankReady = Boolean(saved.maskedAccount && saved.ifsc);
  const hasSavedPayoutDetails = savedUpiReady || savedBankReady;
  const [detailsOpen, setDetailsOpen] = React.useState(!hasSavedPayoutDetails);

  React.useEffect(() => {
    setMethod(saved.preferredMethod || "upi");
    setUpiId(saved.upiId || "");
    setBankName(saved.bankName || "");
    setAccountHolderName(saved.accountHolderName || "");
    setIfsc(saved.ifsc || "");
    setAutoEnabled(Boolean(settings.autoPayoutEnabled));
    setFrequency(settings.autoPayoutFrequency || "weekly");
    setAutoMinimum(String(settings.autoPayoutMinimum || 500));
  }, [saved.preferredMethod, saved.upiId, saved.bankName, saved.accountHolderName, saved.ifsc, settings.autoPayoutEnabled, settings.autoPayoutFrequency, settings.autoPayoutMinimum]);

  React.useEffect(() => {
    if (hasSavedPayoutDetails) {
      setDetailsOpen(false);
    }
  }, [hasSavedPayoutDetails, saved.preferredMethod]);

  const saveSettings = async () => {
    setMsg({ text: "", type: "" });
    if (method === "upi" && !upiId.trim()) {
      setMsg({ text: "UPI ID enter karo.", type: "error" });
      return;
    }
    if (method === "bank" && !saved.maskedAccount && (!accountNumber.trim() || !ifsc.trim())) {
      setMsg({ text: "Bank account number aur IFSC enter karo.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        preferredMethod: method,
        upiId: upiId.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        ifsc: ifsc.trim(),
        autoPayoutEnabled: autoEnabled,
        autoPayoutFrequency: frequency,
        autoPayoutMinimum: Number(autoMinimum) || 500
      };
      if (accountNumber.trim()) payload.accountNumber = accountNumber.trim();
      const { data } = await api.patch("/driver/wallet/payout-settings", payload);
      setMsg({ text: data?.message || "Payout details save ho gayi.", type: "success" });
      setAccountNumber("");
      await onSuccess?.();
      setDetailsOpen(false);
    } catch (error) {
      setMsg({ text: error?.response?.data?.message || "Payout details save nahi ho saki.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setMsg({ text: "", type: "" });
    const amt = Number(amount);
    if (!walletData?.payoutsEnabled) {
      setMsg({ text: walletData?.payoutLiveAccess?.message || "Live RazorpayX payout server par abhi ready nahi hai.", type: "error" });
      return;
    }
    if (!amt || amt < 100) {
      setMsg({ text: "Minimum ₹100 withdrawal hai.", type: "error" });
      return;
    }
    if (amt > balance) {
      setMsg({ text: `Balance sirf ₹${balance.toFixed(0)} hai.`, type: "error" });
      return;
    }
    if (method === "upi" && !upiId.trim()) {
      setMsg({ text: "UPI ID save/enter karo.", type: "error" });
      return;
    }
    if (method === "bank" && !saved.maskedAccount && (!accountNumber.trim() || !ifsc.trim())) {
      setMsg({ text: "Bank details save karo.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        amount: amt,
        method,
        upiId: method === "upi" ? upiId.trim() : "",
        bankName: method === "bank" ? bankName.trim() : "",
        accountHolderName: method === "bank" ? accountHolderName.trim() : "",
        accountNumber: method === "bank" ? accountNumber.trim() : "",
        ifsc: method === "bank" ? ifsc.trim() : ""
      };
      const { data } = await api.post("/driver/wallet/withdraw", payload);
      setMsg({ text: data?.message || "Payout submit ho gaya!", type: "success" });
      setAmount("");
      setAccountNumber("");
      onSuccess?.();
    } catch (error) {
      setMsg({ text: error?.response?.data?.message || "Payout submit nahi ho saka.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="withdrawalFormWrap">
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <strong>Saved payout details</strong>
        <span style={{fontSize:12,color:walletData?.payoutsEnabled ? "#22c55e" : "#f59e0b"}}>
          {walletData?.payoutsEnabled ? "● Withdrawals ready" : "● Withdrawal setup pending"}
        </span>
      </div>
      {!walletData?.payoutsEnabled && walletData?.payoutLiveAccess?.message && (
        <>
          <p className="withdrawalMsg error" style={{marginTop:0}}>
            Instant withdrawal abhi available nahi hai. Wallet earning safe rahegi.
          </p>
          <details className="walletTechnicalStatus">
            <summary>Technical status</summary>
            <small>{walletData.payoutLiveAccess.message}</small>
          </details>
        </>
      )}

      {hasSavedPayoutDetails && !detailsOpen && (
        <div className="savedPayoutSummary">
          <div>
            <small>PAYOUT ACCOUNT SAVED</small>
            <strong>{saved.preferredMethod === "bank" ? "Bank / IMPS" : "UPI"}</strong>
            <span>
              {saved.preferredMethod === "bank"
                ? `Account ${saved.maskedAccount || "saved"}`
                : `UPI ${saved.upiId ? `${saved.upiId.slice(0, 3)}•••${saved.upiId.includes("@") ? `@${saved.upiId.split("@").pop()}` : ""}` : "saved"}`}
            </span>
          </div>
          <button type="button" className="savedPayoutEditBtn" onClick={() => setDetailsOpen(true)}>
            Edit Details
          </button>
        </div>
      )}

      {detailsOpen && (<>
        <div className="withdrawalMethodTabs">
          <button type="button" className={method === "upi" ? "active" : ""} onClick={() => setMethod("upi")}>UPI</button>
          <button type="button" className={method === "bank" ? "active" : ""} onClick={() => setMethod("bank")}>Bank / IMPS</button>
        </div>

        <div className="withdrawalFields">
          {method === "upi" ? (
            <input type="text" placeholder="UPI ID (e.g. name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} />
          ) : (<>
            <input type="text" placeholder="Account Holder Name" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} />
            <input type="text" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />
            {saved.maskedAccount && <small style={{color:"#aaa"}}>Saved account: {saved.maskedAccount}</small>}
            <input type="text" placeholder={saved.maskedAccount ? "New Account Number (blank = saved)" : "Account Number"} value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g,""))} />
            <input type="text" placeholder="IFSC Code" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} />
          </>)}
        </div>

        <div style={{margin:"14px 0",padding:12,border:"1px solid rgba(255,255,255,.12)",borderRadius:12}}>
          <label style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}>
            <span><strong>Automatic transfer</strong><br/><small style={{color:"#aaa"}}>Wallet minimum cross kare to scheduled payout</small></span>
            <input type="checkbox" checked={autoEnabled} onChange={e => setAutoEnabled(e.target.checked)} />
          </label>
          {autoEnabled && <div className="withdrawalFields" style={{marginTop:10}}>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}>
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
            <input type="number" min="100" value={autoMinimum} onChange={e => setAutoMinimum(e.target.value)} placeholder="Minimum auto payout" />
          </div>}
        </div>

        <button type="button" className="withdrawalSubmitBtn" onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save UPI / Bank & Schedule"}
        </button>
      </>)}

      <hr style={{border:0,borderTop:"1px solid rgba(255,255,255,.1)",margin:"18px 0"}} />
      <strong>Instant Withdraw</strong>
      <div className="withdrawalFields" style={{marginTop:10}}>
        <input type="number" placeholder={`Amount (min ₹100, max ₹${balance.toFixed(0)})`} value={amount} min={100} max={balance} onChange={e => setAmount(e.target.value)} />
      </div>
      {msg.text && <p className={`withdrawalMsg ${msg.type}`}>{msg.text}</p>}
      <button type="button" className="withdrawalSubmitBtn" onClick={handleSubmit} disabled={submitting || balance < 100 || !walletData?.payoutsEnabled}>
        {submitting ? "Payout ho raha hai..." : `Instant Withdraw via ${method === "upi" ? "UPI" : "Bank"}`}
      </button>
      {balance < 100 && <p className="withdrawalMsg error">Minimum ₹100 balance chahiye.</p>}
    </div>
  );
}

function DriverDashboard({
  user,
  bookings = [],
  loadBookings,
  logout,
  driverStatus = {
    isOnline: false,
    isAvailable: false,
    loading: false
  },
  updateDriverOnlineStatus
}) {
  const currentUserId =
    getId(user);

  const approved =
    isDriverApproved(user);

  const [
    localBookings,
    setLocalBookings
  ] = useState(
    Array.isArray(bookings)
      ? bookings
      : []
  );

  const [
    incomingRide,
    setIncomingRide
  ] = useState(null);

  const [
    requestExpiresAt,
    setRequestExpiresAt
  ] = useState(null);

  const [
    countdown,
    setCountdown
  ] = useState(0);

  const [
    otpRide,
    setOtpRide
  ] = useState(null);

  const [
    otp,
    setOtp
  ] = useState("");

  const [
    loadingAction,
    setLoadingAction
  ] = useState("");

  const [
    fareInputs,
    setFareInputs
  ] = useState({});

  const [
    fareAction,
    setFareAction
  ] = useState("");

  const [
    driverPaymentModalRide,
    setDriverPaymentModalRide
  ] = useState(null);

  const [
    notice,
    setNotice
  ] = useState({
    type: "",
    message: ""
  });

  /*
  |--------------------------------------------------------------------------
  | Driver Payment Receipt — Phase 13 ADD-ONLY
  |--------------------------------------------------------------------------
  | Customer online/cash payment complete hote hi Driver Dashboard par clear
  | received receipt dikhegi. Driver ise Close kar sakta hai.
  |--------------------------------------------------------------------------
  */

  const [
    driverPaymentReceipt,
    setDriverPaymentReceipt
  ] = useState(null);

  const [
    socketConnected,
    setSocketConnected
  ] = useState(
    socket.connected
  );

  const [
    selectedRideId,
    setSelectedRideId
  ] = useState("");

  const [
    summaryOpen,
    setSummaryOpen
  ] = useState(false);

  const [
    activeTab,
    setActiveTab
  ] = useState("dashboard");

  const [
    completedRideOpenId,
    setCompletedRideOpenId
  ] = useState("");

  const [
    earningsOpen,
    setEarningsOpen
  ] = useState(false);

  const [
    walletQrOpen,
    setWalletQrOpen
  ] = useState(false);

  // ADD-ONLY: live wallet summary for instant payout; legacy profile wallet remains.
  const [walletData, setWalletData] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false);

  const [
    profileSaving,
    setProfileSaving
  ] = useState(false);

  const [
    docReminderOpen,
    setDocReminderOpen
  ] = useState(false);

  const [
    profileTab,
    setProfileTab
  ] = useState("hub");

  /*
  |--------------------------------------------------------------------------
  | Driver Wallet Transaction Filter — ADD-ONLY
  |--------------------------------------------------------------------------
  | Wallet ke andar All / Pending / Completed / Failed transaction history
  | driver profile se directly accessible rahegi.
  |--------------------------------------------------------------------------
  */

  const [
    walletHistoryFilter,
    setWalletHistoryFilter
  ] = useState("all");

  const [
    profileData,
    setProfileData
  ] = useState(user);

  const [
    profileDraft,
    setProfileDraft
  ] = useState({
    alternativePhone:
      user?.alternativePhone || "",
    email: user?.email || "",
    address:
      user?.driverProfile?.address || "",
    vehicleType:
      user?.driverProfile?.vehicle?.vehicleType ||
      "hatchback",
    brand:
      user?.driverProfile?.vehicle?.brand || "",
    model:
      user?.driverProfile?.vehicle?.model || "",
    registrationNumber:
      user?.driverProfile?.vehicle?.registrationNumber || "",
    color:
      user?.driverProfile?.vehicle?.color || "",
    fuelType:
      user?.driverProfile?.vehicle?.fuelType ||
      "petrol",
    seatingCapacity:
      user?.driverProfile?.vehicle?.seatingCapacity ||
      4,
    aadhaarName:
      user?.driverProfile?.legalName ||
      user?.name || "",
    isCommercial:
      user?.driverProfile?.vehicle?.isCommercial ?? true
  });

  const [
    uploadingDocument,
    setUploadingDocument
  ] = useState("");

  const audioContextRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Sync Parent Bookings
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setLocalBookings(
      Array.isArray(bookings)
        ? bookings
        : []
    );
  }, [bookings]);


  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const { data } = await api.get("/driver/wallet");
      if (data?.success) setWalletData(data.data);
    } catch (error) {
      console.error(
        "Wallet load error:",
        error?.response?.data?.message || error.message
      );
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      earningsOpen ||
      (
        profileOpen &&
        profileTab === "wallet"
      )
    ) {
      loadWallet();
    }
  }, [
    earningsOpen,
    profileOpen,
    profileTab,
    loadWallet
  ]);

  /*
  |--------------------------------------------------------------------------
  | Sync Fresh Driver Profile From Parent
  |--------------------------------------------------------------------------
  | Parent App /driver/profile se MongoDB ka latest driver snapshot load karta
  | hai. Yahan documents ko bhi mandatory sync karna zaroori hai. Purane code
  | me legalName/approval same hone par early return ho jata tha, isliye admin
  | verified documents update hone ke baad bhi profileData stale reh sakta tha.
  */
  useEffect(() => {
    if (!user) return;

    setProfileData((previous) => {
      const base = previous || {};

      const merged = {
        ...base,
        ...user,
        driverProfile: {
          ...(base.driverProfile || {}),
          ...(user.driverProfile || {}),
          documents: Array.isArray(
            user?.driverProfile?.documents
          )
            ? user.driverProfile.documents
            : (
                base?.driverProfile?.documents ||
                []
              )
        }
      };

      try {
        if (
          JSON.stringify(previous) ===
          JSON.stringify(merged)
        ) {
          return previous;
        }
      } catch (_) {
        // Merge continue karega.
      }

      return merged;
    });
  }, [user]);

  /*
  |--------------------------------------------------------------------------
  | Document Reminder — login ke baad check karo
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const REQUIRED = [
      "aadhaar",
      "driving_license",
      "vehicle_rc",
      "vehicle_photo",
      "permit"
    ];

    const docs = Array.isArray(
      profileData?.driverProfile?.documents
    )
      ? profileData.driverProfile.documents
      : (
          user?.driverProfile?.documents ||
          []
        );

    const hasIssue = REQUIRED.some((type) => {
      const doc = docs.find(
        (item) =>
          item.documentType === type &&
          item.documentUrl
      );

      if (!doc) return true;

      return (
        doc.verificationStatus ===
        "rejected"
      );
    });

    if (!hasIssue) {
      setDocReminderOpen(false);
      return undefined;
    }

    const timer = setTimeout(
      () => setDocReminderOpen(true),
      1200
    );

    return () => clearTimeout(timer);
  }, [
    profileData?.driverProfile?.documents,
    user?.driverProfile?.documents
  ]);

  /*
  |--------------------------------------------------------------------------
  | Local Booking Update
  |--------------------------------------------------------------------------
  */

  const updateLocalBooking =
    useCallback(
      (updatedRide) => {
        if (
          !updatedRide?._id
        ) {
          return;
        }

        setLocalBookings(
          (previous) => {
            const exists =
              previous.some(
                (ride) =>
                  getId(ride) ===
                  getId(
                    updatedRide
                  )
              );

            if (!exists) {
              return [
                updatedRide,
                ...previous
              ];
            }

            return previous.map(
              (ride) =>
                getId(ride) ===
                getId(
                  updatedRide
                )
                  ? {
                      ...ride,
                      ...updatedRide
                    }
                  : ride
            );
          }
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Notification
  |--------------------------------------------------------------------------
  */

  const showNotice =
    useCallback(
      (
        type,
        message
      ) => {
        setNotice({
          type,
          message
        });

        window.setTimeout(
          () => {
            setNotice({
              type: "",
              message: ""
            });
          },
          4500
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Beep Sound
  |--------------------------------------------------------------------------
  */

  const playRequestSound =
    useCallback(() => {
      playHimRideGEventSound(
        "ride_request"
      ).catch(() => {});
    }, []);


  /*
  |--------------------------------------------------------------------------
  | Socket Connection
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token =
      getStoredToken();

    if (!token) {
      console.warn(
        "Socket token nahi mila."
      );

      return undefined;
    }

    socket.auth = {
      token
    };

    const handleConnect =
      () => {
        setSocketConnected(
          true
        );

        /* Internet/socket reconnect ke turant baad active ride/fare/payment
           server se authoritative state me re-sync karo. */
        loadBookings?.();
      };

    const handleDisconnect =
      () => {
        setSocketConnected(
          false
        );
      };

    const handleConnectError =
      (error) => {
        setSocketConnected(
          false
        );

        console.error(
          "Socket connection error:",
          error.message
        );
      };

    const handleRideRequest =
      (payload) => {
        const ride =
          extractBooking(
            payload
          );

        if (!ride) {
          return;
        }

        const previewOnly =
          Boolean(
            payload?.previewOnly ||
            payload?.actionsLocked ||
            payload?.data?.previewOnly ||
            payload?.data?.actionsLocked
          );

        const nextRide =
          previewOnly
            ? {
                ...ride,
                requestPreviewOnly:
                  true,
                actionsLocked:
                  true,
                actionLockReason:
                  payload?.actionLockReason ||
                  payload?.lockReason ||
                  payload?.data?.actionLockReason ||
                  payload?.data?.lockReason ||
                  "Current ride active. Ride complete hone ke baad Accept / Reject available hoga."
              }
            : ride;

        /*
        |--------------------------------------------------------------------
        | Busy-driver preview requests
        |--------------------------------------------------------------------
        | Preview ko list/local state me rakho, lekin incoming action timer
        | mat banao. Current ride complete hone tak Accept/Reject locked hai.
        |--------------------------------------------------------------------
        */
        if (!previewOnly) {
          setIncomingRide(
            nextRide
          );
        }

        updateLocalBooking(
          nextRide
        );

        if (!previewOnly) {
          const expiry =
            getRequestExpiry(
              payload
            );

          if (expiry) {
            setRequestExpiresAt(
              expiry
            );
          } else {
            setRequestExpiresAt(
              new Date(
                Date.now() +
                  30000
              ).toISOString()
            );
          }
        }

        playRequestSound();

        showNotice(
          "success",
          previewOnly
            ? "Nayi nearby ride aayi hai. Current ride active hone ki wajah se ye preview-only hai."
            : "Nayi ride request aayi hai."
        );
      };

    const handleRequestCancelled =
      (payload) => {
        const cancelledBookingId =
          getId(
            payload?.bookingId ||
              payload?.data
                ?.booking?._id
          );

        setIncomingRide(
          (current) => {
            if (
              !current ||
              getId(current) !==
                cancelledBookingId
            ) {
              return current;
            }

            return null;
          }
        );

        setRequestExpiresAt(
          null
        );

        showNotice(
          "error",
          payload?.message ||
            "Ride request available nahi rahi."
        );

        loadBookings?.();
      };

    const handleRideUpdate =
      (payload) => {
        const ride =
          extractBooking(
            payload
          );

        if (ride) {
          updateLocalBooking(
            ride
          );
        }

        loadBookings?.();
      };

    const handleRideAccepted =
      (payload) => {
        handleRideUpdate(
          payload
        );

        setIncomingRide(
          null
        );

        setRequestExpiresAt(
          null
        );
      };

    const handleRideCompleted =
      (payload) => {
        handleRideUpdate(
          payload
        );

        setOtpRide(null);
        setOtp("");

        playHimRideGEventSound("ride_completed").catch(() => {});

        showNotice(
          "success",
          "Ride successfully complete ho gayi."
        );
      };

    const handleFareUpdate = (payload = {}) => {
      const bookingId = String(
        payload.bookingId || ""
      );

      if (!bookingId) {
        return;
      }

      setLocalBookings((previous) =>
        previous.map((ride) =>
          getId(ride) === bookingId
            ? {
                ...ride,
                ...payload,
                fareStatus:
                  payload.fareStatus ||
                  ride.fareStatus,
                status:
                  payload.rideStatus ||
                  payload.status ||
                  ride.status
              }
            : ride
        )
      );

      loadBookings?.();
    };

    const handleFareCountered = (payload = {}) => {
      handleFareUpdate({
        ...payload,
        fareStatus: "customer_countered",
        status: "negotiating"
      });

      playHimRideGEventSound("fare_counter").catch(() => {});

      showNotice(
        "success",
        payload.message ||
          `Customer ne ₹${Number(
            payload.customerCounterFare || 0
          ).toFixed(0)} ka counter offer bheja.`
      );
    };

    const handleFareAccepted = (payload = {}) => {
      const bookingId = String(payload?.bookingId || "");
      const currentRide = localBookings.find(
        (ride) => getId(ride) === bookingId
      );

      const mergedRide = {
        ...(currentRide || {}),
        ...(payload || {}),
        _id: currentRide?._id || payload?._id || bookingId,
        fareStatus: "fare_accepted",
        status: "fare_accepted",
        finalFare: Number(
          payload?.finalFare ||
            getLockedFinalFare(currentRide) ||
            0
        )
      };

      handleFareUpdate(mergedRide);
      setDriverPaymentModalRide(mergedRide);

      playHimRideGEventSound("fare_locked").catch(() => {});

      showNotice(
        "success",
        payload.message ||
          "Fare final lock ho gaya. Customer payment option choose karega."
      );
    };

    const handleFareRejected = (payload = {}) => {
      const bookingId =
        String(
          payload?.bookingId ||
            payload?._id ||
            ""
        );

      if (bookingId) {
        setLocalBookings((previous) =>
          previous.map((ride) =>
            getId(ride) === bookingId
              ? {
                  ...ride,
                  ...payload,
                  fareStatus: "fare_rejected",
                  status: "searching_driver",
                  driver: null
                }
              : ride
          )
        );

        if (
          selectedRideId ===
          bookingId
        ) {
          setSelectedRideId("");
        }
      }

      setIncomingRide(null);
      setRequestExpiresAt(null);

      playHimRideGEventSound("ride_cancelled").catch(() => {});

      showNotice(
        "error",
        payload.message ||
          "Customer ne FINAL fare reject kiya. Ride release ho gayi aur naya driver search hoga."
      );

      loadBookings?.();
    };

    const handlePaymentUpdate = (payload = {}) => {
      const bookingId = String(payload?.bookingId || "");
      if (!bookingId) return;

      setLocalBookings((previous) =>
        previous.map((ride) =>
          getId(ride) === bookingId
            ? { ...ride, ...payload }
            : ride
        )
      );

      setDriverPaymentModalRide((current) => {
        if (current && getId(current) === bookingId) {
          return { ...current, ...payload };
        }

        const ride = localBookings.find(
          (item) => getId(item) === bookingId
        );

        return ride ? { ...ride, ...payload } : current;
      });

      loadBookings?.();
    };

    const handlePaymentPlanUpdated = (payload = {}) => {
      handlePaymentUpdate(payload);
      setDriverPaymentModalRide((current) => {
        const bookingId = String(payload?.bookingId || "");
        if (current && getId(current) === bookingId) {
          return { ...current, ...payload };
        }
        const ride = localBookings.find((item) => getId(item) === bookingId);
        return ride ? { ...ride, ...payload } : current;
      });

      showNotice(
        "success",
        payload?.paymentPlan === "advance"
          ? "Customer ne Advance Payment select ki. Payment paid hone tak ride actions locked hain."
          : payload?.paymentPlan === "scheduled"
            ? "Customer ne Scheduled Payment select ki. Pay Now option available hai."
            : "Customer ne Payment Online select ki."
      );
    };

    const handlePaymentCompleted = (payload = {}) => {
      const paidPayload = {
        ...payload,
        paymentStatus: "paid"
      };

      handlePaymentUpdate(
        paidPayload
      );

      playHimRideGEventSound(
        "payment_received_driver"
      ).catch(() => {});

      const paidMethod =
        String(
          payload?.paymentMethod ||
            ""
        )
          .trim()
          .toLowerCase();

      const paidFare =
        Number(
          payload?.fare ||
            payload?.amount ||
            0
        );

      setDriverPaymentReceipt({
        ...paidPayload,
        fare: paidFare,
        paymentMethod:
          paidMethod ||
          "online"
      });

      showNotice(
        "success",
        paidMethod === "cash"
          ? `Cash Received ₹${paidFare.toFixed(0)} ✅`
          : `Payment Received ₹${paidFare.toFixed(0)} ✅`
      );
    };

    const handleSocketError =
      (payload) => {
        console.error(
          "Socket error:",
          payload
        );
      };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "socket:error",
      handleSocketError
    );

    socket.on(
      "ride:request",
      handleRideRequest
    );

    socket.on(
      "ride:request:cancelled",
      handleRequestCancelled
    );

    socket.on(
      "ride:accepted",
      handleRideAccepted
    );

    socket.on(
      "ride:driver-arriving",
      handleRideUpdate
    );

    socket.on(
      "ride:driver-arrived",
      handleRideUpdate
    );

    socket.on(
      "ride:otp-verified",
      handleRideUpdate
    );

    socket.on(
      "ride:started",
      handleRideUpdate
    );

    socket.on(
      "ride:completed",
      handleRideCompleted
    );

    socket.on(
      "ride:cancelled",
      handleRideUpdate
    );

    socket.on(
      "ride:status-updated",
      handleRideUpdate
    );

    socket.on(
      "fare:countered",
      handleFareCountered
    );

    socket.on(
      "fare:customer-countered",
      handleFareCountered
    );

    socket.on(
      "fare:driver-offered",
      handleFareUpdate
    );

    socket.on(
      "fare:final-offered",
      handleFareUpdate
    );

    socket.on(
      "fare:accepted",
      handleFareAccepted
    );

    socket.on(
      "fare:final-rejected",
      handleFareRejected
    );

    socket.on(
      "fare:rejected",
      handleFareRejected
    );

    socket.on(
      "fare:status:updated",
      handleFareUpdate
    );

    socket.on(
      "payment:plan-updated",
      handlePaymentPlanUpdated
    );

    socket.on(
      "payment:method-updated",
      handlePaymentUpdate
    );

    socket.on(
      "payment:cash-selected",
      handlePaymentUpdate
    );

    socket.on(
      "payment:completed",
      handlePaymentCompleted
    );

    if (
      !socket.connected
    ) {
      socket.connect();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "socket:error",
        handleSocketError
      );

      socket.off(
        "ride:request",
        handleRideRequest
      );

      socket.off(
        "ride:request:cancelled",
        handleRequestCancelled
      );

      socket.off(
        "ride:accepted",
        handleRideAccepted
      );

      socket.off(
        "ride:driver-arriving",
        handleRideUpdate
      );

      socket.off(
        "ride:driver-arrived",
        handleRideUpdate
      );

      socket.off(
        "ride:otp-verified",
        handleRideUpdate
      );

      socket.off(
        "ride:started",
        handleRideUpdate
      );

      socket.off(
        "ride:completed",
        handleRideCompleted
      );

      socket.off(
        "ride:cancelled",
        handleRideUpdate
      );

      socket.off(
        "ride:status-updated",
        handleRideUpdate
      );

      socket.off(
        "fare:countered",
        handleFareCountered
      );

      socket.off(
        "fare:customer-countered",
        handleFareCountered
      );

      socket.off(
        "fare:driver-offered",
        handleFareUpdate
      );

      socket.off(
        "fare:final-offered",
        handleFareUpdate
      );

      socket.off(
        "fare:accepted",
        handleFareAccepted
      );

      socket.off(
        "fare:final-rejected",
        handleFareRejected
      );

      socket.off(
        "fare:rejected",
        handleFareRejected
      );

      socket.off(
        "fare:status:updated",
        handleFareUpdate
      );

      socket.off(
        "payment:plan-updated",
        handlePaymentPlanUpdated
      );

      socket.off(
        "payment:method-updated",
        handlePaymentUpdate
      );

      socket.off(
        "payment:cash-selected",
        handlePaymentUpdate
      );

      socket.off(
        "payment:completed",
        handlePaymentCompleted
      );
    };
  }, [
    loadBookings,
    playRequestSound,
    showNotice,
    updateLocalBooking
  ]);

  useEffect(() => {
    const handleOnline = () => {
      loadBookings?.();

      if (!socket.connected) {
        socket.connect();
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [loadBookings]);

  /*
  |--------------------------------------------------------------------------
  | Join Active Ride Rooms
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !socket.connected
    ) {
      return undefined;
    }

    const activeBookingIds =
      localBookings
        .filter((ride) =>
          ACTIVE_RIDE_STATUSES.includes(
            ride.status
          )
        )
        .filter(
          (ride) =>
            getAssignedDriverId(
              ride
            ) === currentUserId
        )
        .map((ride) =>
          getId(ride)
        )
        .filter(Boolean);

    activeBookingIds.forEach(
      (bookingId) => {
        socket.emit(
          "ride:join",
          {
            bookingId
          }
        );
      }
    );

    return () => {
      activeBookingIds.forEach(
        (bookingId) => {
          socket.emit(
            "ride:leave",
            {
              bookingId
            }
          );
        }
      );
    };
  }, [
    currentUserId,
    localBookings,
    socketConnected
  ]);

  /*
  |--------------------------------------------------------------------------
  | Ride Request Countdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !incomingRide ||
      !requestExpiresAt
    ) {
      setCountdown(0);
      return undefined;
    }

    const updateCountdown =
      () => {
        const remaining =
          Math.max(
            0,
            Math.ceil(
              (
                new Date(
                  requestExpiresAt
                ).getTime() -
                Date.now()
              ) /
                1000
            )
          );

        setCountdown(
          remaining
        );

        if (
          remaining <= 0
        ) {
          setIncomingRide(
            null
          );

          setRequestExpiresAt(
            null
          );
        }
      };

    updateCountdown();

    const timer =
      window.setInterval(
        updateCountdown,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    incomingRide,
    requestExpiresAt
  ]);

  /*
  |--------------------------------------------------------------------------
  | API Helper
  |--------------------------------------------------------------------------
  */

  const performRideAction =
    useCallback(
      async ({
        ride,
        actionName,
        request,
        successMessage
      }) => {
        const bookingId =
          getId(ride);

        if (!bookingId) {
          showNotice(
            "error",
            "Booking ID nahi mili."
          );

          return null;
        }

        setLoadingAction(
          `${bookingId}:${actionName}`
        );

        try {
          const response =
            await request(
              bookingId
            );

          const updatedRide =
            response?.data?.data
              ?.booking ||
            response?.data
              ?.booking ||
            response?.data?.data ||
            null;

          if (
            updatedRide?._id
          ) {
            updateLocalBooking(
              updatedRide
            );
          }

          if (
            successMessage
          ) {
            showNotice(
              "success",
              successMessage
            );
          }

          await loadBookings?.();

          return (
            updatedRide ||
            ride
          );
        } catch (error) {
          showNotice(
            "error",
            getErrorMessage(
              error
            )
          );

          return null;
        } finally {
          setLoadingAction("");
        }
      },
      [
        loadBookings,
        showNotice,
        updateLocalBooking
      ]
    );

  const sendDriverFare = async (ride) => {
    const bookingId = getId(ride);
    const fare = Number(
      fareInputs[bookingId]
    );

    if (!bookingId) {
      showNotice("error", "Booking ID nahi mili.");
      return;
    }

    if (!Number.isFinite(fare) || fare < 50 || fare > 10000) {
      showNotice(
        "error",
        "Fare ₹50 se ₹10,000 ke beech enter karo."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Customer counter ke baad Driver FINAL Fare
    |--------------------------------------------------------------------------
    |
    | Latest HimRideG rule:
    | Driver initial fare -> Customer counter -> Driver FINAL fare ->
    | Customer Accept / Reject -> Accept par fare lock.
    |
    */

    const hasPersistedCustomerCounter =
      Number(ride?.customerCounterFare || 0) > 0 &&
      Number(ride?.driverFinalFareProposal || 0) <= 0 &&
      String(ride?.fareStatus || "").toLowerCase() !== "fare_accepted";

    if (hasPersistedCustomerCounter) {
      setFareAction(`${bookingId}:final`);

      try {
        const { data } = await api.post(
          `/fares/${bookingId}/driver-final`,
          { fare }
        );

        const result = data?.data || data || {};

        setLocalBookings((previous) =>
          previous.map((item) =>
            getId(item) === bookingId
              ? {
                  ...item,
                  driverFinalFareProposal: fare,
                  fareStatus: "driver_final",
                  fareOfferedBy: "driver",
                  fareOfferCount: Number(result.fareOfferCount || item.fareOfferCount || 0),
                  status: result.rideStatus || "negotiating"
                }
              : item
          )
        );

        setFareInputs((current) => ({
          ...current,
          [bookingId]: ""
        }));

        showNotice(
          "success",
          `₹${fare.toFixed(0)} final fare customer ko bhej diya. Ab customer Accept / Reject karega.`
        );

        await loadBookings?.();
      } catch (error) {
        showNotice(
          "error",
          error?.response?.data?.message ||
            error?.message ||
            "Final fare nahi bheja ja saka."
        );
      } finally {
        setFareAction("");
      }

      return;
    }

    setFareAction(`${bookingId}:offer`);

    try {
      const { data } =
        await api.post(
          `/fares/${bookingId}/driver-offer`,
          {
            fare
          }
        );

      const result =
        data?.data ||
        data ||
        {};

      setLocalBookings((previous) =>
        previous.map((item) =>
          getId(item) === bookingId
            ? {
                ...item,
                driverOfferedFare:
                  Number(
                    result.offeredFare ||
                      fare
                  ),
                fareStatus:
                  result.fareStatus ||
                  "driver_offered",
                fareOfferedBy:
                  result.fareOfferedBy ||
                  "driver",
                fareOfferCount:
                  Number(
                    result.fareOfferCount ||
                      1
                  ),
                status: "fare_offered"
              }
            : item
        )
      );

      setFareInputs((current) => ({
        ...current,
        [bookingId]: ""
      }));

      showNotice(
        "success",
        `₹${fare.toFixed(0)} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega.`
      );

      await loadBookings?.();
    } catch (error) {
      showNotice(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Fare offer nahi bheja ja saka."
      );
    } finally {
      setFareAction("");
    }
  };

  const acceptCustomerCounter = async (ride) => {
    const bookingId = getId(ride);

    if (!bookingId) {
      return;
    }

    setFareAction(`${bookingId}:accept`);

    socket.emit(
      "fare:accept",
      { bookingId },
      async (response) => {
        setFareAction("");

        if (!response?.success) {
          showNotice(
            "error",
            response?.message ||
              "Counter offer accept nahi hua."
          );
          return;
        }

        showNotice(
          "success",
          "Customer ka counter offer accept ho gaya."
        );

        await loadBookings?.();
      }
    );
  };

  const rejectCustomerCounter = async (ride) => {
    const bookingId = getId(ride);

    if (!bookingId) {
      return;
    }

    setFareAction(`${bookingId}:reject`);

    socket.emit(
      "fare:reject",
      { bookingId },
      async (response) => {
        setFareAction("");

        if (!response?.success) {
          showNotice(
            "error",
            response?.message ||
              "Counter offer reject nahi hua."
          );
          return;
        }

        showNotice(
          "success",
          "Counter reject hua. Ab naya fare bhejo."
        );

        await loadBookings?.();
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Ride Actions
  |--------------------------------------------------------------------------
  */

  const acceptRide =
    async (ride) => {
      if (!approved) {
        showNotice(
          "error",
          "Driver account approval required hai."
        );

        return;
      }

      const result =
        await performRideAction({
          ride,
          actionName:
            "accept",

          request:
            (bookingId) =>
              api.post(
                `/rides/${bookingId}/accept`,
                {}
              ),

          successMessage:
            "Ride accept ho gayi."
        });

      if (result) {
        setIncomingRide(
          null
        );

        setRequestExpiresAt(
          null
        );
      }
    };

  const rejectRide =
    async (ride) => {
      const result =
        await performRideAction({
          ride,
          actionName:
            "reject",

          request:
            async (bookingId) => {
              try {
                return await api.patch(
                  `/rides/${bookingId}/reject`,
                  {}
                );
              } catch (error) {
                if (
                  error?.response?.status === 404 ||
                  error?.response?.status === 405
                ) {
                  return api.post(
                    `/rides/${bookingId}/reject`,
                    {}
                  );
                }

                throw error;
              }
            },

          successMessage:
            "Ride request reject kar di."
        });

      if (result) {
        setIncomingRide(
          null
        );

        setRequestExpiresAt(
          null
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Driver Release Accepted / Unconfirmed Ride
  |--------------------------------------------------------------------------
  |
  | Customer response na de, fare lock na ho ya ride confirm na ho to driver
  | current ride release kar sakta hai. Customer booking cancel nahi hoti;
  | current driver free hota hai aur ride dobara dispatch hoti hai.
  |
  */

  const releaseAcceptedRide =
    async (ride) => {
      const bookingId =
        getId(ride);

      if (!bookingId) {
        showNotice(
          "error",
          "Booking ID nahi mili."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Is unconfirmed ride ko release karna hai? Aap turant next ride lene ke liye available ho jayenge."
        );

      if (!confirmed) {
        return;
      }

      setLoadingAction(
        `${bookingId}:release`
      );

      try {
        const { data } =
          await api.patch(
            `/rides/${bookingId}/driver-release`,
            {
              reason:
                "Customer not responding / ride not confirmed"
            }
          );

        showNotice(
          "success",
          data?.message ||
            "Ride release ho gayi. Aap next ride le sakte hain."
        );

        setIncomingRide(null);
        setRequestExpiresAt(null);
        setSelectedRideId("");

        await loadBookings?.();
      } catch (error) {
        showNotice(
          "error",
          error?.response?.data?.message ||
            error?.message ||
            "Ride release nahi hui."
        );
      } finally {
        setLoadingAction("");
      }
    };

  const confirmCashReceived =
    async (ride) => {
      const bookingId =
        getId(ride);

      if (!bookingId) {
        return;
      }

      const fare =
        Number(
          getFinalFare(ride) ||
          0
        );

      const confirmed =
        window.confirm(
          `Customer se ₹${fare.toFixed(0)} cash receive hua confirm karna hai?`
        );

      if (!confirmed) {
        return;
      }

      setLoadingAction(
        `${bookingId}:cash-confirm`
      );

      try {
        const { data } =
          await api.post(
            "/payments/cash-confirm",
            {
              bookingId
            }
          );

        showNotice(
          "success",
          data?.message ||
            "Cash payment confirmed."
        );

        await loadBookings?.();
      } catch (error) {
        showNotice(
          "error",
          error?.response?.data?.message ||
            error?.message ||
            "Cash payment confirm nahi hui."
        );
      } finally {
        setLoadingAction("");
      }
    };

  const markArriving =
    async (ride) => {
      await performRideAction({
        ride,
        actionName:
          "arriving",

        request:
          (bookingId) =>
            api.patch(
              `/rides/${bookingId}/arriving`,
              {}
            ),

        successMessage:
          "Pickup ke liye journey start ho gayi."
      });
    };

  const markArrived =
    async (ride) => {
      await performRideAction({
        ride,
        actionName:
          "arrived",

        request:
          (bookingId) =>
            api.patch(
              `/rides/${bookingId}/arrived`,
              {}
            ),

        successMessage:
          "Customer ko arrival update bhej diya."
      });
    };

  const regenerateRideOtp =
    async (ride) => {
      const bookingId =
        getId(ride);

      if (!bookingId) {
        showNotice(
          "error",
          "Booking ID nahi mili."
        );

        return;
      }

      setLoadingAction(
        `${bookingId}:regenerate-otp`
      );

      try {
        const response =
          await api.post(
            `/rides/${bookingId}/regenerate-start-otp`,
            {}
          );

        const responseData =
          response?.data?.data ||
          response?.data ||
          {};

        const updatedRide =
          responseData?.booking ||
          null;

        const newOtp =
          responseData?.rideStartOtp ||
          responseData?.otp ||
          "";

        if (updatedRide?._id) {
          updateLocalBooking(
            updatedRide
          );
        }

        if (!newOtp) {
          throw new Error(
            "Naya OTP response me nahi mila"
          );
        }

        setOtpRide(
          updatedRide || ride
        );

        setOtp(String(newOtp));

        showNotice(
          "success",
          `Naya ride OTP: ${newOtp}`
        );

        await loadBookings?.();
      } catch (error) {
        showNotice(
          "error",
          getErrorMessage(error)
        );
      } finally {
        setLoadingAction("");
      }
    };

  const verifyOtpAndStartRide =
    async () => {
      const ride =
        otpRide;

      const bookingId =
        getId(ride);

      const cleanOtp =
        String(otp).trim();

      if (
        !/^\d{4,6}$/.test(
          cleanOtp
        )
      ) {
        showNotice(
          "error",
          "Valid 4 digit OTP enter karo."
        );

        return;
      }

      setLoadingAction(
        `${bookingId}:verify`
      );

      try {
        const verifyResponse =
          await api.post(
            `/rides/${bookingId}/verify-start-otp`,
            {
              otp: cleanOtp
            }
          );

        const verifiedBooking =
          verifyResponse?.data
            ?.data?.booking;

        if (
          verifiedBooking
        ) {
          updateLocalBooking(
            verifiedBooking
          );
        }

        const startResponse =
          await api.patch(
            `/rides/${bookingId}/start`,
            {}
          );

        const startedBooking =
          startResponse?.data
            ?.data?.booking;

        if (
          startedBooking
        ) {
          updateLocalBooking(
            startedBooking
          );
        }

        setOtpRide(null);
        setOtp("");

        showNotice(
          "success",
          "OTP verified. Ride start ho gayi."
        );

        await loadBookings?.();
      } catch (error) {
        showNotice(
          "error",
          getErrorMessage(
            error
          )
        );
      } finally {
        setLoadingAction("");
      }
    };

  const completeRide =
    async (ride) => {
      const confirmed =
        window.confirm(
          "Kya customer destination par pahunch gaya hai?"
        );

      if (!confirmed) {
        return;
      }

      await performRideAction({
        ride,
        actionName:
          "complete",

        request:
          (bookingId) =>
            api.patch(
              `/rides/${bookingId}/complete`,
              {}
            ),

        successMessage:
          "Ride destination par complete ho gayi. Ab customer payment ka wait hai."
      });
    };

  const applyUpdatedDriver =
    useCallback(
      (driver) => {
        if (!driver) {
          return;
        }

        setProfileData(driver);

        setProfileDraft({
          alternativePhone:
            driver.alternativePhone || "",
          email: driver.email || "",
          address:
            driver.driverProfile?.address || "",
          vehicleType:
            driver.driverProfile?.vehicle?.vehicleType ||
            "hatchback",
          brand:
            driver.driverProfile?.vehicle?.brand || "",
          model:
            driver.driverProfile?.vehicle?.model || "",
          registrationNumber:
            driver.driverProfile?.vehicle?.registrationNumber ||
            "",
          color:
            driver.driverProfile?.vehicle?.color || "",
          fuelType:
            driver.driverProfile?.vehicle?.fuelType ||
            "petrol",
          seatingCapacity:
            driver.driverProfile?.vehicle?.seatingCapacity ||
            4,
          aadhaarName:
            driver.driverProfile?.legalName ||
            driver.name || "",
          isCommercial:
            driver.driverProfile?.vehicle?.isCommercial ?? true
        });

        sessionStorage.setItem(
          "himrideg_user",
          JSON.stringify(driver)
        );
      },
      []
    );

  const saveDriverProfile =
    async (event) => {
      event.preventDefault();
      setProfileSaving(true);

      try {
        const { data } = await api.patch(
          "/driver/profile",
          {
            alternativePhone:
              profileDraft.alternativePhone,
            email: profileDraft.email,
            address: profileDraft.address,
            vehicle: {
              vehicleType:
                profileDraft.vehicleType,
              brand: profileDraft.brand,
              model: profileDraft.model,
              registrationNumber:
                profileDraft.registrationNumber,
              color: profileDraft.color,
              fuelType:
                profileDraft.fuelType,
              seatingCapacity: Number(
                profileDraft.seatingCapacity
              ),
              isCommercial:
                Boolean(profileDraft.isCommercial)
            }
          }
        );

        const driver =
          data?.data?.driver ||
          data?.driver;

        applyUpdatedDriver(driver);
        showNotice(
          "success",
          data?.message ||
            "Profile save ho gayi"
        );
      } catch (error) {
        showNotice(
          "error",
          getErrorMessage(error)
        );
      } finally {
        setProfileSaving(false);
      }
    };

  const uploadDriverPhoto =
    async (file) => {
      if (!file) {
        return;
      }

      setUploadingDocument(
        "profile_photo"
      );

      try {
        const formData = new FormData();
        formData.append(
          "profilePhoto",
          file
        );

        const { data } = await api.post(
          "/driver/profile/photo",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

        applyUpdatedDriver(
          data?.data?.driver ||
          data?.driver
        );

        showNotice(
          "success",
          "Profile photo update ho gayi"
        );
      } catch (error) {
        showNotice(
          "error",
          getErrorMessage(error)
        );
      } finally {
        setUploadingDocument("");
      }
    };

  const uploadDriverDocument =
    async (
      documentType,
      file
    ) => {
      if (!file) {
        return;
      }

      if (
        documentType === "aadhaar" &&
        String(
          profileDraft.aadhaarName
        ).trim().length < 3
      ) {
        showNotice(
          "error",
          "Aadhaar card wala poora naam enter karo"
        );
        return;
      }

      setUploadingDocument(
        documentType
      );

      try {
        const formData = new FormData();
        formData.append(
          "document",
          file
        );

        if (
          documentType === "aadhaar"
        ) {
          formData.append(
            "nameOnDocument",
            profileDraft.aadhaarName.trim()
          );
        }

        const { data } = await api.post(
          `/driver/documents/${documentType}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

        // Server returns updated documents array (not full driver)
        const updatedDocuments =
          data?.data?.documents ||
          data?.documents;

        if (updatedDocuments) {
          // Manually merge documents into profileData
          setProfileData(prev => {
            const base = prev || user || {};
            const updated = {
              ...base,
              driverProfile: {
                ...(base.driverProfile || {}),
                documents: updatedDocuments
              }
            };
            try {
              sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
        } else {
          // Fallback: try full driver object
          applyUpdatedDriver(
            data?.data?.driver ||
            data?.driver
          );
        }

        showNotice(
          "success",
          data?.message ||
            "Document upload ho gaya ✓"
        );
      } catch (error) {
        showNotice(
          "error",
          getErrorMessage(error)
        );
      } finally {
        setUploadingDocument("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Combined Booking List
  |--------------------------------------------------------------------------
  */

  const displayBookings =
    useMemo(() => {
      const rideMap =
        new Map();

      localBookings.forEach(
        (ride) => {
          const rideId =
            getId(ride);

          if (rideId) {
            rideMap.set(
              rideId,
              ride
            );
          }
        }
      );

      if (incomingRide) {
        const incomingId =
          getId(
            incomingRide
          );

        if (incomingId) {
          rideMap.set(
            incomingId,
            {
              ...rideMap.get(
                incomingId
              ),
              ...incomingRide
            }
          );
        }
      }

      return Array.from(
        rideMap.values()
      ).sort(
        (firstRide, secondRide) =>
          new Date(
            secondRide.updatedAt ||
              secondRide.createdAt ||
              0
          ).getTime() -
          new Date(
            firstRide.updatedAt ||
              firstRide.createdAt ||
              0
          ).getTime()
      );
    }, [
      incomingRide,
      localBookings
    ]);

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const pendingRides =
    displayBookings.filter(
      (ride) =>
        [
          "pending",
          "searching_driver",
          "driver_assigned"
        ].includes(
          ride.status
        )
    ).length;

  const acceptedRides =
    displayBookings.filter(
      (ride) =>
        [
          "accepted",
          "fare_offered",
          "negotiating",
          "fare_accepted",
          "driver_arriving",
          "driver_arrived"
        ].includes(
          ride.status
        )
    ).length;

  const startedRides =
    displayBookings.filter(
      (ride) =>
        ride.status ===
        "started"
    ).length;

  const waitingPaymentRideList =
    displayBookings
      .filter(
        (ride) =>
          isWaitingForPaymentRide(
            ride
          )
      )
      .sort(
        (a, b) =>
          new Date(
            b?.completedAt ||
              b?.updatedAt ||
              0
          ).getTime() -
          new Date(
            a?.completedAt ||
              a?.updatedAt ||
              0
          ).getTime()
      );

  const waitingPaymentRides =
    waitingPaymentRideList.length;

  const cashSelectedWaitingRide =
    waitingPaymentRideList.find(
      (ride) =>
        canConfirmCashForRide(
          ride
        )
    ) ||
    null;

  const latestWaitingPaymentRide =
    cashSelectedWaitingRide ||
    waitingPaymentRideList[0] ||
    null;

  /*
  |------------------------------------------------------------------------
  | Payment Fallback Poll
  |------------------------------------------------------------------------
  | payment:cash-selected socket primary hai. Socket miss/reconnect case me
  | 15 sec safety fallback poll rahega; hidden tab me polling pause rahegi.
  |------------------------------------------------------------------------
  */
  useEffect(() => {
    if (
      waitingPaymentRides <= 0 ||
      typeof loadBookings !== "function"
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          if (document.visibilityState !== "visible") {
            return;
          }

          loadBookings?.();
        },
        15000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    loadBookings,
    waitingPaymentRides
  ]);

  const completedRides =
    displayBookings.filter(
      (ride) =>
        isFinalCompletedRide(
          ride
        )
    ).length;

  const requestRides =
    useMemo(
      () =>
        displayBookings.filter(
          (ride) =>
            ![
              "completed",
              "cancelled",
              "expired"
            ].includes(
              ride.status
            )
        ),
      [displayBookings]
    );

  /*
  |--------------------------------------------------------------------------
  | Explicit Ride Selection
  |--------------------------------------------------------------------------
  |
  | Incoming ride pehle LIST me aayegi. Driver jab kisi ride par tap/click
  | karega tabhi selectedRide set hogi aur Accept / Reject detail me dikhenge.
  | Pehli request ko automatic open nahi karna.
  |
  */

  const selectedRide =
    useMemo(
      () => {
        if (!selectedRideId) {
          return null;
        }

        return (
          requestRides.find(
            (ride) =>
              getId(ride) ===
              selectedRideId
          ) ||
          null
        );
      },
      [
        displayBookings,
        requestRides,
        selectedRideId
      ]
    );

  useEffect(() => {
    if (
      selectedRideId &&
      !requestRides.some(
        (ride) =>
          getId(ride) ===
          selectedRideId
      )
    ) {
      setSelectedRideId(
        ""
      );
    }
  }, [
    requestRides,
    selectedRideId
  ]);

  const tabRides =
    useMemo(() => {
      if (
        activeTab === "completed"
      ) {
        return displayBookings.filter(
          (ride) =>
            isFinalCompletedRide(
              ride
            )
        );
      }

      if (
        activeTab === "payment"
      ) {
        return displayBookings.filter(
          (ride) =>
            isWaitingForPaymentRide(
              ride
            )
        );
      }

      if (activeTab === "active") {
        return displayBookings.filter(
          (ride) =>
            ACTIVE_RIDE_STATUSES.includes(
              ride.status
            )
        );
      }

      if (
        activeTab === "requests"
      ) {
        return displayBookings.filter(
          (ride) =>
            [
              "pending",
              "searching",
              "searching_driver",
              "driver_assigned"
            ].includes(
              ride.status
            )
        );
      }

      return displayBookings.filter(
        (ride) =>
          [
            "pending",
            "searching_driver",
            "driver_assigned"
          ].includes(
            ride.status
          )
      );
    }, [
      activeTab,
      displayBookings
    ]);

  const blockingCurrentRide =
    displayBookings.find(
      (ride) =>
        ACTIVE_RIDE_STATUSES.includes(
          String(
            ride?.status ||
              ""
          ).toLowerCase()
        ) &&
        getAssignedDriverId(
          ride
        ) === currentUserId
    ) || null;

  const selectedRideIdValue =
    getId(selectedRide);

  const selectedAssignedDriverId =
    getAssignedDriverId(
      selectedRide
    );

  const selectedAssignedToMe =
    Boolean(
      selectedAssignedDriverId &&
      selectedAssignedDriverId ===
        currentUserId
    );

  const selectedFareLocked =
    isFinalFareLocked(selectedRide);

  /*
  |------------------------------------------------------------------------
  | Fare stage derived from persisted values + accepted authority
  |------------------------------------------------------------------------
  | Socket reconnect me fareStatus stale ho sakta hai. Amount fields ko use
  | karke website wahi stage dikhati hai jo mobile app dikhata hai. Fare lock
  | sirf fare_accepted par hota hai.
  |------------------------------------------------------------------------
  */

  const selectedDriverInitialFare =
    Number(
      selectedRide?.driverOfferedFare ||
        0
    );

  const selectedCustomerCounterFare =
    Number(
      selectedRide?.customerCounterFare ||
        0
    );

  const selectedDriverFinalFare =
    Number(
      selectedRide?.driverFinalFareProposal ||
        0
    );

  const selectedRawFareStatus =
    String(
      selectedRide?.fareStatus ||
        "not_offered"
    ).toLowerCase();

  /*
  |------------------------------------------------------------------------
  | V26 Final Fare Sync Recovery
  |------------------------------------------------------------------------
  | Purani/stale booking me kabhi fareStatus `driver_final` persist ho gaya
  | lekin driverFinalFareProposal 0/null raha. Aisi state ko valid FINAL fare
  | nahi maana jayega. Driver ko customer ke one-time counter ke against ek
  | safe resend/recovery action milega. Valid final fare (> 0) ko kabhi
  | overwrite nahi kiya jayega.
  |------------------------------------------------------------------------
  */

  const selectedFinalFareNeedsRecovery =
    !selectedFareLocked &&
    selectedRawFareStatus === "driver_final" &&
    selectedDriverFinalFare <= 0 &&
    selectedCustomerCounterFare > 0;

  const selectedFareStage =
    selectedFareLocked
      ? "fare_accepted"
      : selectedFinalFareNeedsRecovery
        ? "driver_final_recovery"
        : selectedDriverFinalFare > 0
          ? "driver_final"
          : selectedCustomerCounterFare > 0
            ? "customer_countered"
            : selectedDriverInitialFare > 0
              ? "driver_offered"
              : "not_offered";

  const selectedAdvancePending =
    isAdvancePaymentPending(selectedRide);

  const selectedRideActionsEnabled =
    canUseDriverRideActions(selectedRide);

  const selectedIsRequest =
    Boolean(
      selectedRide &&
      [
        "pending",
        "searching",
        "searching_driver",
        "driver_assigned"
      ].includes(
        selectedRide.status
      )
    );

  const selectedPreviewLocked =
    Boolean(
      selectedRide &&
      (
        selectedRide?.requestPreviewOnly ===
          true ||
        selectedRide?.actionsLocked ===
          true ||
        (
          blockingCurrentRide &&
          getId(
            blockingCurrentRide
          ) !==
            selectedRideIdValue &&
          selectedIsRequest
        )
      )
    );

  const selectedCanAccept =
    Boolean(
      approved &&
      selectedIsRequest &&
      !selectedPreviewLocked &&
      (
        !selectedAssignedDriverId ||
        selectedAssignedToMe ||
        getId(incomingRide) ===
          selectedRideIdValue
      )
    );

  const selectedCanReject =
    Boolean(
      selectedIsRequest &&
      !selectedPreviewLocked &&
      (
        !selectedAssignedDriverId ||
        selectedAssignedToMe ||
        getId(incomingRide) ===
          selectedRideIdValue
      )
    );

  const selectedCountdown =
    getId(incomingRide) ===
    selectedRideIdValue
      ? countdown
      : 30;

  const driverView =
    profileData || user || {};

  const driverDocuments =
    Array.isArray(
      driverView?.driverProfile?.documents
    )
      ? driverView.driverProfile.documents
      : [];

  const displayDriverName =
    driverView?.driverProfile?.legalName ||
    driverView?.name ||
    "Driver";

  const driverWallet =
    driverView?.wallet || {};

  /*
  | Real earnings wallet balance API se prefer karo. Profile snapshot fallback
  | preserve hai taaki wallet endpoint temporarily unavailable ho to UI na toote.
  */
  const realDriverWalletBalance = Number(
    walletData?.wallet?.balance ??
      driverWallet.balance ??
      0
  );

  const realDriverPendingAmount = Number(
    walletData?.wallet?.pendingAmount ??
      driverWallet.pendingAmount ??
      driverWallet.pendingBalance ??
      0
  );

  /*
  |--------------------------------------------------------------------------
  | Driver Wallet History — Profile Hub
  |--------------------------------------------------------------------------
  */

  const driverWalletTransactions =
    Array.isArray(
      walletData?.transactions
    )
      ? walletData.transactions
      : [];

  const getDriverWalletTransactionStatus = (
    transaction
  ) => {
    const rawStatus =
      String(
        transaction?.status ||
          ""
      )
        .trim()
        .toLowerCase();

    if (
      rawStatus === "pending"
    ) {
      return "pending";
    }

    if (
      rawStatus === "failed"
    ) {
      return "failed";
    }

    if (
      rawStatus === "settled" ||
      rawStatus === "completed" ||
      rawStatus === "success" ||
      rawStatus === "processed"
    ) {
      return "completed";
    }

    return "completed";
  };

  const filteredDriverWalletTransactions =
    driverWalletTransactions.filter(
      (transaction) => {
        if (
          walletHistoryFilter ===
          "all"
        ) {
          return true;
        }

        return (
          getDriverWalletTransactionStatus(
            transaction
          ) ===
          walletHistoryFilter
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Fixed Driver Wallet QR
  |--------------------------------------------------------------------------
  | QR me amount nahi hota. Sirf driver identity hoti hai. Customer scanner
  | assigned driver verify karta hai; amount booking ka final locked fare hai.
  */
  const driverWalletQrValue = JSON.stringify({
    type: "himrideg_driver_wallet",
    version: 1,
    driverId: currentUserId,
  });

  const driverWalletQrImageUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(
      driverWalletQrValue
    )}`;

  /*
  |--------------------------------------------------------------------------
  | Document Gate — Required docs check
  |--------------------------------------------------------------------------
  */

  const REQUIRED_DOCS = [
    { type:"aadhaar",         icon:"🪪", label:"Aadhaar Card"      },
    { type:"driving_license", icon:"🚘", label:"Driving Licence"   },
    { type:"vehicle_rc",      icon:"📄", label:"Vehicle RC"        },
    { type:"vehicle_photo",   icon:"📷", label:"Vehicle Photo"     },
    { type:"permit",          icon:"🚕", label:"Commercial Permit" },
  ];

  const docGateStatus = REQUIRED_DOCS.map(req => {
    const doc = driverDocuments.find(d => d.documentType === req.type && d.documentUrl);
    return {
      ...req,
      uploaded: Boolean(doc),
      status:   doc?.verificationStatus || "not_uploaded",
      rejected: doc?.verificationStatus === "rejected",
      reason:   doc?.rejectionReason || "",
    };
  });

  const allUploaded    = docGateStatus.every(d => d.uploaded && !d.rejected);
  const allVerified    = docGateStatus.every(d => d.status === "verified");
  const hasRejected    = docGateStatus.some(d => d.rejected);
  const uploadedCount  = docGateStatus.filter(d => d.uploaded).length;
  const verifiedCount  = docGateStatus.filter(d => d.status === "verified").length;

  /*
  |--------------------------------------------------------------------------
  | Approved Driver Must Never Re-enter Document Gate — ADD-ONLY FIX
  |--------------------------------------------------------------------------
  | Admin approval final authority hai. Agar approved=true hai to historical
  | upload mirror/cache/document list temporarily empty/stale hone par bhi
  | driver ko "Verification Baaki Hai" popup nahi dikhaya jayega.
  */

  // Gate 1: Sirf unapproved driver ke docs missing/rejected hon to upload karo.
  const showDocGate =
    !approved &&
    !allUploaded;

  // Gate 2: Docs uploaded hain lekin admin approval abhi pending hai.
  const showUnderReview =
    !approved &&
    allUploaded;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="driverDashboardPage">
      {notice.message && (
        <div
          className={`driverNotice ${notice.type}`}
        >
          {notice.message}
        </div>
      )}

      {driverPaymentReceipt && (
        <div
          className="driverPaymentReceiptOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Payment received"
        >
          <div className="driverPaymentReceiptCard">
            <button
              type="button"
              className="driverPaymentReceiptClose"
              onClick={() =>
                setDriverPaymentReceipt(
                  null
                )
              }
              aria-label="Close payment receipt"
            >
              ×
            </button>

            <div className="driverPaymentReceiptIcon">
              {String(
                driverPaymentReceipt?.paymentMethod ||
                  ""
              ).toLowerCase() === "cash"
                ? "💵"
                : "✅"}
            </div>

            <small>
              {String(
                driverPaymentReceipt?.paymentMethod ||
                  ""
              ).toLowerCase() === "cash"
                ? "CASH RECEIVED"
                : "PAYMENT RECEIVED"}
            </small>

            <h2>
              ₹{Number(
                driverPaymentReceipt?.fare ||
                  driverPaymentReceipt?.amount ||
                  0
              ).toFixed(0)}
            </h2>

            <p>
              {String(
                driverPaymentReceipt?.paymentMethod ||
                  ""
              ).toLowerCase() === "cash"
                ? "Customer ki cash payment complete ho gayi. Aap next ride le sakte hain."
                : "Customer ki online payment receive ho gayi. Aap next ride le sakte hain."}
            </p>

            <button
              type="button"
              className="driverPaymentReceiptDone"
              onClick={() =>
                setDriverPaymentReceipt(
                  null
                )
              }
            >
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          DOCUMENT GATE
      ═══════════════════════════════════════════ */}
      {showDocGate ? (
        <div style={{minHeight:"100vh",background:"#080a0d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
          {/* Top bar */}
          <div style={{position:"fixed",top:0,left:0,right:0,background:"#0d1117",borderBottom:"1px solid rgba(245,197,24,0.2)",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:100}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{background:"#f5c518",color:"#000",fontWeight:"900",padding:"6px 10px",borderRadius:"8px",fontSize:"14px"}}>HG</div>
              <div>
                <div style={{color:"#aaa",fontSize:"10px",fontWeight:"700",letterSpacing:"1px"}}>HIMACHAL KI APNI RIDE</div>
                <div style={{color:"#fff",fontWeight:"700",fontSize:"14px"}}>HimRideG Driver</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <span style={{color:"#aaa",fontSize:"13px"}}>{displayDriverName}</span>
              <button type="button" onClick={()=>{if(typeof logout==="function")logout();}} style={{padding:"6px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"#fff",cursor:"pointer",fontSize:"13px"}}>Logout</button>
            </div>
          </div>

          {/* Main card */}
          <div style={{marginTop:"80px",maxWidth:"520px",width:"100%",background:"#0d1117",border:"1px solid rgba(245,197,24,0.25)",borderRadius:"20px",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}>
            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#1a1000 0%,#1a1a2e 100%)",padding:"28px 28px 20px",borderBottom:"1px solid rgba(245,197,24,0.15)"}}>
              <div style={{fontSize:"40px",marginBottom:"10px"}}>{hasRejected?"⚠️":"📋"}</div>
              <h2 style={{color:"#f5c518",margin:"0 0 6px",fontSize:"20px"}}>{hasRejected?"Kuch Documents Reject Hue":"Documents Upload Karo"}</h2>
              <p style={{color:"#888",fontSize:"13px",margin:0,lineHeight:1.5}}>
                {hasRejected
                  ?"Rejected documents dobara upload karo. Tab tak dashboard access nahi milega."
                  :"Ride lene se pehle saare 5 required documents upload karo. Admin verify karega."}
              </p>
              {/* Progress */}
              <div style={{marginTop:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <span style={{color:"#aaa",fontSize:"12px"}}>Upload Progress</span>
                  <span style={{color:"#f5c518",fontSize:"12px",fontWeight:"700"}}>{uploadedCount}/{REQUIRED_DOCS.length} uploaded</span>
                </div>
                <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"10px",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:"10px",background:hasRejected?"#ef4444":"#f5c518",width:`${(uploadedCount/REQUIRED_DOCS.length)*100}%`,transition:"width 0.4s"}}/>
                </div>
              </div>
            </div>

            {/* Document list */}
            <div style={{padding:"20px 28px",display:"flex",flexDirection:"column",gap:"10px"}}>
              {docGateStatus.map(doc=>(
                <div key={doc.type} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"12px",background:doc.rejected?"rgba(239,68,68,0.07)":doc.uploaded?"rgba(34,197,94,0.06)":"rgba(255,255,255,0.03)",border:doc.rejected?"1px solid rgba(239,68,68,0.3)":doc.uploaded?"1px solid rgba(34,197,94,0.2)":"1px solid rgba(255,255,255,0.08)"}}>
                  <span style={{fontSize:"20px",flexShrink:0}}>{doc.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{color:"#fff",fontWeight:"600",fontSize:"13px"}}>{doc.label}</div>
                    {doc.rejected&&doc.reason&&<div style={{color:"#f87171",fontSize:"11px",marginTop:"2px"}}>Rejected: {doc.reason}</div>}
                    {!doc.uploaded&&<div style={{color:"#888",fontSize:"11px",marginTop:"2px"}}>Upload nahi hua</div>}
                    {doc.uploaded&&!doc.rejected&&<div style={{color:doc.status==="verified"?"#4ade80":"#f5c518",fontSize:"11px",marginTop:"2px"}}>{doc.status==="verified"?"✓ Verified":"⏳ Admin review pending"}</div>}
                  </div>
                  <div style={{flexShrink:0}}>
                    {doc.uploaded&&!doc.rejected
                      ?<span style={{fontSize:"18px"}}>{doc.status==="verified"?"✅":"🟡"}</span>
                      :<label style={{padding:"6px 14px",borderRadius:"8px",background:doc.rejected?"#ef4444":"#f5c518",color:doc.rejected?"#fff":"#000",fontSize:"12px",fontWeight:"700",cursor:uploadingDocument?"not-allowed":"pointer",opacity:uploadingDocument===doc.type?0.6:1,display:"inline-block"}}>
                        {uploadingDocument===doc.type?"Uploading...":doc.rejected?"📤 Re-Upload":"📤 Upload"}
                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{display:"none"}} disabled={Boolean(uploadingDocument)} onChange={e=>{uploadDriverDocument(doc.type,e.target.files?.[0]);e.target.value="";}}/>
                      </label>}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{padding:"16px 28px",borderTop:"1px solid rgba(255,255,255,0.07)",background:"rgba(0,0,0,0.3)",textAlign:"center"}}>
              <p style={{color:"#666",fontSize:"11px",margin:0}}>
                Saare documents upload hone ke baad Admin verify karega. Verification ke baad dashboard aur rides available honge.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════
          UNDER REVIEW GATE — Docs uploaded, waiting for admin
      ═══════════════════════════════════════════ */}
      {!showDocGate && showUnderReview && (
        <div style={{minHeight:"100vh",background:"#080a0d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
          {/* Top bar */}
          <div style={{position:"fixed",top:0,left:0,right:0,background:"#0d1117",borderBottom:"1px solid rgba(245,197,24,0.2)",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:100}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{background:"#f5c518",color:"#000",fontWeight:"900",padding:"6px 10px",borderRadius:"8px",fontSize:"14px"}}>HG</div>
              <div>
                <div style={{color:"#aaa",fontSize:"10px",fontWeight:"700",letterSpacing:"1px"}}>HIMACHAL KI APNI RIDE</div>
                <div style={{color:"#fff",fontWeight:"700",fontSize:"14px"}}>HimRideG Driver</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <span style={{color:"#aaa",fontSize:"13px"}}>{displayDriverName}</span>
              <button type="button" onClick={()=>{if(typeof logout==="function")logout();}} style={{padding:"6px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"#fff",cursor:"pointer",fontSize:"13px"}}>Logout</button>
            </div>
          </div>

          <div style={{marginTop:"80px",maxWidth:"500px",width:"100%",background:"#0d1117",border:"1px solid rgba(245,197,24,0.2)",borderRadius:"20px",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}>
            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#0d1117,#1a1a2e)",padding:"32px 28px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
              <div style={{fontSize:"52px",marginBottom:"12px"}}>⏳</div>
              <h2 style={{color:"#f5c518",margin:"0 0 8px",fontSize:"22px"}}>Documents Under Review</h2>
              <p style={{color:"#888",fontSize:"13px",margin:0,lineHeight:1.6}}>
                Tumhare saare documents admin ke paas review ke liye hain.<br/>
                Approval ke baad rides aana shuru hongi.
              </p>
            </div>

            {/* Doc status list */}
            <div style={{padding:"20px 28px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <div style={{color:"#aaa",fontSize:"11px",fontWeight:"700",letterSpacing:"1px",marginBottom:"4px"}}>DOCUMENT STATUS</div>
              {docGateStatus.map(doc=>(
                <div key={doc.type} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",background:doc.status==="verified"?"rgba(34,197,94,0.06)":"rgba(245,197,24,0.04)",border:doc.status==="verified"?"1px solid rgba(34,197,94,0.2)":"1px solid rgba(245,197,24,0.15)"}}>
                  <span style={{fontSize:"16px"}}>{doc.icon}</span>
                  <span style={{flex:1,color:"#fff",fontSize:"13px",fontWeight:"500"}}>{doc.label}</span>
                  <span style={{
                    fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"20px",
                    background:doc.status==="verified"?"rgba(34,197,94,0.15)":"rgba(245,197,24,0.12)",
                    color:doc.status==="verified"?"#4ade80":"#f5c518"
                  }}>
                    {doc.status==="verified"?"✓ Verified":"⏳ Pending"}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{padding:"0 28px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{color:"#888",fontSize:"12px"}}>Verification Progress</span>
                <span style={{color:"#f5c518",fontSize:"12px",fontWeight:"700"}}>{verifiedCount}/{REQUIRED_DOCS.length} verified</span>
              </div>
              <div style={{height:"6px",background:"rgba(255,255,255,0.07)",borderRadius:"10px",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:"10px",background:"#22c55e",width:`${(verifiedCount/REQUIRED_DOCS.length)*100}%`,transition:"width 0.4s"}}/>
              </div>
            </div>

            {/* Info box */}
            <div style={{margin:"0 28px 24px",padding:"14px",background:"rgba(245,197,24,0.05)",border:"1px solid rgba(245,197,24,0.15)",borderRadius:"12px"}}>
              <div style={{color:"#f5c518",fontWeight:"700",fontSize:"13px",marginBottom:"6px"}}>ℹ Admin kya karega?</div>
              <div style={{color:"#888",fontSize:"12px",lineHeight:1.6}}>
                Admin tumhare documents khol kar verify karega.<br/>
                Verification ke baad tumhara account approve hoga<br/>
                aur dashboard + rides automatically unlock ho jayenge.
              </div>
            </div>

            {/* Footer */}
            <div style={{padding:"16px 28px",borderTop:"1px solid rgba(255,255,255,0.07)",background:"rgba(0,0,0,0.3)",textAlign:"center"}}>
              <p style={{color:"#555",fontSize:"11px",margin:0}}>
                Page refresh karo ya logout karke dobara login karo approval status check karne ke liye.
              </p>
              <button type="button"
                onClick={()=>window.location.reload()}
                style={{marginTop:"10px",padding:"8px 20px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"#aaa",cursor:"pointer",fontSize:"12px"}}>
                🔄 Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}

      {!showDocGate && !showUnderReview && otpRide && (
        <div className="driverOtpOverlay">
          <div className="driverOtpModal">
            <div className="driverOtpIcon">🔐</div>
            <h2>Customer OTP Enter Karo</h2>
            <p>
              Customer ke phone par dikh raha ride-start OTP enter karo.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              maxLength={4}
              className="driverOtpInput"
              value={otp}
              placeholder="0000"
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  verifyOtpAndStartRide();
                }
              }}
            />
            <div className="driverOtpRegenerateRow">
              <button
                type="button"
                className="driverOtpRegenerate"
                disabled={Boolean(loadingAction)}
                onClick={() =>
                  regenerateRideOtp(otpRide)
                }
              >
                {loadingAction.endsWith(
                  ":regenerate-otp"
                )
                  ? "Generating New OTP..."
                  : "↻ Regenerate OTP"}
              </button>
              <small>
                Naya OTP banne par purana OTP invalid ho jayega.
              </small>
            </div>

            <div className="driverOtpActions">
              <button
                type="button"
                className="driverOtpCancel"
                onClick={() => {
                  setOtpRide(null);
                  setOtp("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="driverOtpVerify"
                disabled={
                  Boolean(loadingAction) ||
                  otp.length !== 4
                }
                onClick={verifyOtpAndStartRide}
              >
                {loadingAction.endsWith(":verify")
                  ? "Verifying..."
                  : "Verify & Start Ride"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showDocGate && !showUnderReview && summaryOpen && (
        <div
          className="driverSummaryOverlay"
          onClick={() =>
            setSummaryOpen(false)
          }
        >
          <section
            className="driverSummaryModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <small>DRIVER SUMMARY</small>
                <h2>Aapki performance</h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSummaryOpen(false)
                }
              >
                ×
              </button>
            </header>
            <div className="driverSummaryGrid">
              <article><span>🚕</span><small>Total Requests</small><strong>{displayBookings.length}</strong></article>
              <article><span>⏳</span><small>Pending</small><strong>{pendingRides}</strong></article>
              <article><span>✅</span><small>Accepted</small><strong>{acceptedRides}</strong></article>
              <article><span>🛣️</span><small>Ongoing</small><strong>{startedRides}</strong></article>
              <article><span>💳</span><small>Waiting Payment</small><strong>{waitingPaymentRides}</strong></article>
              <article><span>🏁</span><small>Completed</small><strong>{completedRides}</strong></article>
              <article><span>⭐</span><small>Rating</small><strong>{Number(user?.driverProfile?.rating || 0).toFixed(1)}</strong></article>
            </div>

            {/*
            |------------------------------------------------------------------
            | Mobile Driver Wallet Access — ADD-ONLY
            |------------------------------------------------------------------
            | Mobile CSS desktop navigation ko hide karta hai, isliye wallet ka
            | direct entry Driver Summary me bhi rakha gaya hai. Existing
            | earnings/wallet modal aur backend wallet API same hi use hote hain.
            */}
            <button
              type="button"
              className="driverSummaryWalletButton"
              onClick={() => {
                setSummaryOpen(false);
                setEarningsOpen(true);
              }}
            >
              <span>💰</span>
              <div>
                <small>DRIVER WALLET</small>
                <strong>₹{realDriverWalletBalance.toFixed(0)} available</strong>
              </div>
              <b>Open Wallet →</b>
            </button>

            <DriverWarnings
              onProfileUpdate={loadBookings}
            />
          </section>
        </div>
      )}

      {!showDocGate && !showUnderReview && walletQrOpen && (
        <div
          className="driverSummaryOverlay"
          onClick={() => setWalletQrOpen(false)}
        >
          <section
            className="driverSummaryModal"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <header>
              <div>
                <small>DRIVER WALLET QR</small>
                <h2>Fixed Payment QR</h2>
              </div>
              <button type="button" onClick={() => setWalletQrOpen(false)}>
                ×
              </button>
            </header>

            <div
              style={{
                display: "grid",
                placeItems: "center",
                gap: 14,
                padding: "24px 10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: "#ffffff",
                  boxShadow: "0 16px 45px rgba(0,0,0,.25)",
                }}
              >
                <img
                  src={driverWalletQrImageUrl}
                  alt={`HimRideG Driver Wallet QR - ${displayDriverName}`}
                  width="250"
                  height="250"
                  style={{ display: "block" }}
                />
              </div>

              <div>
                <strong style={{ display: "block", fontSize: 18 }}>
                  {displayDriverName}
                </strong>
                <small style={{ color: "#8a8f98" }}>
                  Driver ID: {currentUserId || "Unavailable"}
                </small>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#b8bdc7",
                  lineHeight: 1.6,
                  maxWidth: 430,
                }}
              >
                Customer completed ride ke payment screen se Camera Scanner open
                karke is QR ko scan karega. QR driver identity verify karta hai;
                payment amount hamesha final locked fare rahega.
              </p>

              <div
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(245,197,24,.08)",
                  border: "1px solid rgba(245,197,24,.25)",
                  color: "#f5c518",
                  fontSize: 12,
                }}
              >
                🔒 Fixed QR · No editable amount · Assigned-driver verification
              </div>
            </div>
          </section>
        </div>
      )}

      {!showDocGate && !showUnderReview && earningsOpen && (
        <div
          className="driverSummaryOverlay"
          onClick={() =>
            setEarningsOpen(false)
          }
        >
          <section
            className="driverSummaryModal driverEarningsModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <small>EARNINGS</small>
                <h2>Income & Commission</h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEarningsOpen(false)
                }
              >
                ×
              </button>
            </header>

            <button
              type="button"
              className="driverCustomerSummaryBtn"
              style={{ width: "100%", marginBottom: 16, minHeight: 46 }}
              onClick={() => setWalletQrOpen(true)}
            >
              ▦ Show My Fixed Driver Wallet QR
            </button>

            <div className="driverEarningsGrid">
              <article>
                <span>Real Wallet Balance</span>
                <strong>₹{realDriverWalletBalance.toFixed(0)}</strong>
              </article>
              <article>
                <span>Pending Amount</span>
                <strong>₹{realDriverPendingAmount.toFixed(0)}</strong>
              </article>
              <article>
                <span>Total Earned</span>
                <strong>₹{Number(driverWallet.totalEarned || 0).toFixed(0)}</strong>
              </article>
              <article>
                <span>Total Withdrawn</span>
                <strong>₹{Number(driverWallet.totalWithdrawn || 0).toFixed(0)}</strong>
              </article>
              <article>
                <span>Today Earnings</span>
                <strong>₹{Number(walletData?.todayEarnings || 0).toFixed(0)}</strong>
              </article>
              <article>
                <span>This Month</span>
                <strong>₹{Number(walletData?.monthEarnings || 0).toFixed(0)}</strong>
              </article>
              <article>
                <span>Cash Commission Due</span>
                <strong>₹{Number(walletData?.wallet?.cashCommissionDue ?? driverWallet.commissionDue ?? 0).toFixed(0)}</strong>
              </article>
              <article>
                <span>Completed Trips</span>
                <strong>{completedRides}</strong>
              </article>
              <article>
                <span>HimRideG Commission</span>
                <strong>10%</strong>
              </article>
              <article>
                <span>Driver Online Share</span>
                <strong>90%</strong>
              </article>
            </div>

            <div
              className="driverWithdrawalForm realWalletInfoPanel"
              style={{
                border: "1px solid rgba(34,197,94,0.35)",
                background: "rgba(34,197,94,0.06)"
              }}
            >
              <h3>💰 Real Driver Earnings Wallet</h3>
              <p>
                Customer Paytm / UPI se locked fare pay karega. Ride complete +
                payment verify hone ke baad <strong>10% HimRideG commission</strong>
                platform Razorpay collection me retain hogi aur <strong>90% driver
                share</strong> is earnings wallet me credit hoga. Withdrawal live
                RazorpayX payout se saved UPI ya bank account par jayega.
              </p>
              <button
                type="button"
                className="withdrawalSubmitBtn"
                onClick={loadWallet}
                disabled={walletLoading}
              >
                {walletLoading ? "Refreshing Wallet..." : "↻ Refresh Real Wallet"}
              </button>
            </div>

            <div className="driverWithdrawalForm walletActivityPanel">
              <h3>🧾 Recent Wallet Activity</h3>
              <p>Latest ride credits, cash commission aur withdrawals yahan clearly dikhte hain.</p>
              {Array.isArray(walletData?.transactions) && walletData.transactions.length > 0 ? (
                <div className="walletActivityList">
                  {walletData.transactions.slice(0, 6).map((transaction, index) => {
                    const direction = String(transaction?.direction || "").toLowerCase();
                    const prefix = direction === "credit" ? "+" : direction === "debit" ? "−" : "";
                    return (
                      <article key={transaction?._id || `${transaction?.referenceId || "wallet"}-${transaction?.createdAt || index}`}>
                        <div>
                          <strong>{transaction?.description || "Wallet activity"}</strong>
                          <small>{formatDate(transaction?.createdAt)}</small>
                        </div>
                        <b className={direction}>{prefix}₹{Number(transaction?.amount || 0).toFixed(0)}</b>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="walletActivityEmpty">Abhi wallet transaction history nahi hai.</div>
              )}
            </div>

            {Number(walletData?.wallet?.cashCommissionDue ?? driverWallet.commissionDue ?? 0) > 0 && (
              <div className="driverWithdrawalForm">
                <h3>＋ Cash Commission Top-up</h3>
                <p>
                  Existing add-money code preserve hai. Iska use cash rides ki
                  pending HimRideG commission clear karne ke liye rakha gaya hai.
                  Customer online ride earning ka 90% is top-up se alag real
                  earnings wallet credit hota hai.
                </p>

                <WalletTopupForm
                  onSuccess={(data) => {
                    if (data?.wallet) {
                      setProfileData((current) => ({
                        ...(current || {}),
                        wallet: data.wallet
                      }));
                    }
                  }}
                />
              </div>
            )}

            <div className="driverWithdrawalForm">
              <h3>💸 Real Wallet Withdrawal</h3>
              <div className="walletAvailableBalance">
                <small>AVAILABLE TO WITHDRAW</small>
                <strong>₹{realDriverWalletBalance.toFixed(0)}</strong>
              </div>
              <p>
                Available Earnings Balance: <strong>₹{realDriverWalletBalance.toFixed(0)}</strong>
              </p>

              <InstantPayoutForm
                balance={realDriverWalletBalance}
                walletData={walletData}
                onSuccess={async () => {
                  await loadWallet();
                }}
              />

              {/*
              | Legacy admin withdrawal UI/code preserve kiya gaya hai. Real money
              | mode me duplicate withdrawal request create na ho isliye render off.
              */}
              {false && (
                <WithdrawalForm
                  balance={realDriverWalletBalance}
                  onSuccess={() => setEarningsOpen(false)}
                />
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── Document Upload Reminder Popup ── */}
      {!showDocGate && !showUnderReview && docReminderOpen && (() => {
        const REQUIRED = ["aadhaar","driving_license","vehicle_rc","vehicle_photo","permit"];
        const docs = user?.driverProfile?.documents || [];
        const issues = REQUIRED.map(type => {
          const doc = docs.find(d => d.documentType === type && d.documentUrl);
          const LABELS = {
            aadhaar:"Aadhaar Card", driving_license:"Driving Licence",
            vehicle_rc:"Vehicle RC", vehicle_photo:"Vehicle Photo", permit:"Commercial Permit"
          };
          if (!doc) return { type, label: LABELS[type], status: "not_uploaded" };
          if (doc.verificationStatus === "rejected") return { type, label: LABELS[type], status: "rejected", reason: doc.rejectionReason };
          return null;
        }).filter(Boolean);

        return (
          <div style={{
            position:"fixed", inset:0, zIndex:12000,
            background:"rgba(0,0,0,0.82)", backdropFilter:"blur(6px)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"
          }}>
            <div style={{
              background:"#0d1117", border:"2px solid #f5c518",
              borderRadius:"20px", padding:"28px", maxWidth:"460px", width:"100%",
              boxShadow:"0 24px 60px rgba(0,0,0,0.7)"
            }}>
              <div style={{ textAlign:"center", marginBottom:"20px" }}>
                <div style={{ fontSize:"48px", marginBottom:"8px" }}>📄</div>
                <h2 style={{ color:"#f5c518", margin:"0 0 8px", fontSize:"20px" }}>Documents Required</h2>
                <p style={{ color:"#aaa", fontSize:"13px", margin:0 }}>
                  Ride lene se pehle yeh documents upload aur verify karwao
                </p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
                {issues.map(item => (
                  <div key={item.type} style={{
                    display:"flex", alignItems:"center", gap:"10px",
                    padding:"10px 12px", borderRadius:"10px",
                    background: item.status==="rejected" ? "rgba(239,68,68,0.08)" : "rgba(245,197,24,0.06)",
                    border: item.status==="rejected" ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(245,197,24,0.2)"
                  }}>
                    <span style={{ fontSize:"18px" }}>{item.status==="rejected" ? "🔴" : "⚪"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#fff", fontWeight:"600", fontSize:"13px" }}>{item.label}</div>
                      {item.status==="rejected" && item.reason && (
                        <div style={{ color:"#f87171", fontSize:"11px", marginTop:"2px" }}>Rejected: {item.reason}</div>
                      )}
                      {item.status==="not_uploaded" && (
                        <div style={{ color:"#888", fontSize:"11px", marginTop:"2px" }}>Upload nahi hua</div>
                      )}
                    </div>
                    <span style={{
                      fontSize:"11px", fontWeight:"700", padding:"2px 8px", borderRadius:"10px",
                      background: item.status==="rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,197,24,0.12)",
                      color: item.status==="rejected" ? "#f87171" : "#f5c518"
                    }}>
                      {item.status==="rejected" ? "Rejected" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:"10px" }}>
                <button type="button"
                  onClick={() => setDocReminderOpen(false)}
                  style={{
                    flex:1, padding:"11px", background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px",
                    color:"#aaa", fontWeight:"600", cursor:"pointer", fontSize:"13px"
                  }}>
                  Baad mein
                </button>
                <button type="button"
                  onClick={() => {
                    setDocReminderOpen(false);
                    setTimeout(() => {
                      setProfileOpen(true);
                      setProfileTab("documents");
                    }, 100);
                  }}
                  style={{
                    flex:2, padding:"11px", background:"#f5c518",
                    border:"none", borderRadius:"10px",
                    color:"#000", fontWeight:"700", cursor:"pointer", fontSize:"14px"
                  }}>
                  📤 Documents Upload Karo
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {!showDocGate && !showUnderReview && profileOpen && (() => {
        const legalNameDoc = driverDocuments.find(d => d.documentType === "aadhaar");
        const isNameLocked =
          legalNameDoc?.verificationStatus === "verified" ||
          driverView?.driverProfile?.legalNameVerified === true;

        const DOC_META = {
          aadhaar:               { icon: "🪪", label: "Aadhaar Card" },
          driving_license:       { icon: "🚘", label: "Driving Licence" },
          vehicle_rc:            { icon: "📄", label: "Vehicle RC" },
          insurance:             { icon: "🛡", label: "Vehicle Insurance" },
          pollution_certificate: { icon: "🌿", label: "Pollution Certificate" },
          permit:                { icon: "🚕", label: "Commercial Permit" },
          fitness_certificate:   { icon: "✅", label: "Fitness Certificate" },
          vehicle_photo:         { icon: "📷", label: "Vehicle Photo" },
        };

        const approvalStatus = driverView?.driverProfile?.approvalStatus || "pending";
        const rejectedDocs = driverDocuments.filter(d => d.verificationStatus === "rejected").length;

        let statusBadge;
        if (approvalStatus === "approved") {
          statusBadge = { text: "✓ Approved", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
        } else if (approvalStatus === "rejected") {
          statusBadge = { text: "✗ Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
        } else if (rejectedDocs > 0) {
          statusBadge = { text: `⚠ Action Required — ${rejectedDocs} rejected`, color: "#f97316", bg: "rgba(249,115,22,0.12)" };
        } else {
          statusBadge = { text: "⏳ Documents Under Review", color: "#f5c518", bg: "rgba(245,197,24,0.1)" };
        }

        return (
          <div className="hgProfileOverlay" onClick={() => setProfileOpen(false)}>
            <div className="hgProfileModal" onClick={e => e.stopPropagation()}>

              {/* ── Identity Bar ── */}
              <div className="hgProfileHead">
                <button type="button" className="hgProfileCloseBtn" onClick={() => setProfileOpen(false)}>×</button>

                <div className="hgProfileIdentity">
                  <div className="hgProfileAvatar">
                    {driverView?.profileImage
                      ? <img src={driverView.profileImage} alt={displayDriverName} />
                      : displayDriverName.charAt(0).toUpperCase()}
                    <label className="hgProfileAvatarEdit" title="Change Photo">
                      📷
                      <input type="file" accept="image/jpeg,image/png,image/webp"
                        disabled={Boolean(uploadingDocument)}
                        onChange={e => { uploadDriverPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </div>

                  <div className="hgProfileName">
                    <strong>{displayDriverName}</strong>
                    <span>{driverView?.phone || ""}</span>
                    <span className="hgStatusBadge" style={{ color: statusBadge.color, background: statusBadge.bg, borderColor: statusBadge.color }}>
                      {statusBadge.text}
                    </span>
                  </div>
                </div>

                <div className="hgProfileTabs hgDriverProfileTabs">
                  {[
                    ["hub","⌂ Menu"],
                    ["profile","👤 Profile"],
                    ["wallet","💰 Wallet"],
                    ["summary","▥ Summary"],
                    ["documents","📄 Docs"]
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      className={`hgProfileTabBtn${profileTab === tab ? " active" : ""}`}
                      onClick={() =>
                        setProfileTab(
                          tab
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ══════ DRIVER PROFILE FEATURE HUB — ADD-ONLY ══════ */}
              {profileTab === "hub" && (
                <div className="hgDriverProfileHub">
                  <div className="hgDriverHubIntro">
                    <small>DRIVER ACCOUNT</small>
                    <h2>Profile</h2>
                    <p>
                      Profile, wallet, rides aur summary sab ek jagah se manage karo.
                    </p>
                  </div>

                  <div className="hgDriverHubCards">
                    <button
                      type="button"
                      className="hgDriverHubCard"
                      onClick={() =>
                        setProfileTab(
                          "profile"
                        )
                      }
                    >
                      <span className="hgDriverHubIcon">👤</span>
                      <div>
                        <strong>Driver Profile</strong>
                        <small>Personal info, vehicle aur contact details</small>
                      </div>
                      <b>›</b>
                    </button>

                    <button
                      type="button"
                      className="hgDriverHubCard wallet"
                      onClick={() =>
                        setProfileTab(
                          "wallet"
                        )
                      }
                    >
                      <span className="hgDriverHubIcon">💰</span>
                      <div>
                        <strong>Wallet & Payments</strong>
                        <small>
                          ₹{realDriverWalletBalance.toFixed(0)} available · transactions & withdrawal
                        </small>
                      </div>
                      <b>›</b>
                    </button>

                    <button
                      type="button"
                      className="hgDriverHubCard"
                      onClick={() =>
                        setProfileTab(
                          "summary"
                        )
                      }
                    >
                      <span className="hgDriverHubIcon">▥</span>
                      <div>
                        <strong>Driver Summary</strong>
                        <small>Requests, completed rides, rating & total earnings</small>
                      </div>
                      <b>›</b>
                    </button>

                    <button
                      type="button"
                      className="hgDriverHubCard"
                      onClick={() => {
                        setProfileOpen(
                          false
                        );
                        setActiveTab(
                          "active"
                        );
                      }}
                    >
                      <span className="hgDriverHubIcon">🚕</span>
                      <div>
                        <strong>My Rides</strong>
                        <small>Active, payment pending aur completed ride history</small>
                      </div>
                      <b>›</b>
                    </button>

                    <button
                      type="button"
                      className="hgDriverHubCard"
                      onClick={() =>
                        setProfileTab(
                          "documents"
                        )
                      }
                    >
                      <span className="hgDriverHubIcon">📄</span>
                      <div>
                        <strong>Documents</strong>
                        <small>Licence, RC, permit aur verification status</small>
                      </div>
                      <b>›</b>
                    </button>

                    <button
                      type="button"
                      className="hgDriverHubCard"
                      onClick={() => {
                        setProfileOpen(
                          false
                        );
                        setActiveTab(
                          "requests"
                        );
                      }}
                    >
                      <span className="hgDriverHubIcon">🔔</span>
                      <div>
                        <strong>Ride Requests</strong>
                        <small>New customer requests aur notifications</small>
                      </div>
                      <b>›</b>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="hgDriverHubLogout"
                    onClick={logout}
                  >
                    ↪ Logout Driver
                  </button>
                </div>
              )}

              {/* ══════ PROFILE TAB ══════ */}
              {profileTab === "profile" && (
                <form onSubmit={saveDriverProfile} style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0, overflow:"hidden" }}>
                  <div className="hgProfileBody">

                    {/* Personal Details */}
                    <div>
                      <div className="hgSectionLabel">Personal Details</div>
                      <div className="hgFieldGrid">

                        {/* Legal Name */}
                        <label>
                          <span className="hgFieldLabel">Legal Name (As per Aadhaar)</span>
                          <div style={{ position:"relative" }}>
                            <input
                              className={`hgFieldInput${isNameLocked ? " locked" : ""}`}
                              value={profileDraft.aadhaarName}
                              readOnly={isNameLocked}
                              onChange={e => !isNameLocked && setProfileDraft({...profileDraft, aadhaarName: e.target.value})}
                              placeholder="Aadhaar wala poora naam"
                            />
                            {isNameLocked && (
                              <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)" }} title="Verified — locked">🔒</span>
                            )}
                          </div>
                          <small className={`hgFieldNote${isNameLocked ? " success" : ""}`}>
                            {isNameLocked ? "✓ Admin verified — change nahi hoga" : "Aadhaar upload ke baad admin verify karega"}
                          </small>
                        </label>

                        {/* Primary Mobile */}
                        <label>
                          <span className="hgFieldLabel">Primary Verified Mobile</span>
                          <input className="hgFieldInput" value={driverView?.phone || ""} readOnly />
                          <small className="hgFieldNote">OTP verification ke bina change nahi hoga</small>
                        </label>

                        {/* Alt Mobile */}
                        <label>
                          <span className="hgFieldLabel">Alternative Mobile</span>
                          <input className="hgFieldInput" type="tel"
                            value={profileDraft.alternativePhone}
                            onChange={e => setProfileDraft({...profileDraft, alternativePhone: e.target.value.replace(/[^0-9+]/g,"")})}
                            placeholder="+91 XXXXX XXXXX" />
                        </label>

                        {/* Email */}
                        <label>
                          <span className="hgFieldLabel">Email Address</span>
                          <input className="hgFieldInput" type="email"
                            value={profileDraft.email}
                            onChange={e => setProfileDraft({...profileDraft, email: e.target.value})}
                            placeholder="email@example.com" />
                        </label>

                        {/* Address */}
                        <label className="full">
                          <span className="hgFieldLabel">Address</span>
                          <textarea className="hgFieldTextarea"
                            value={profileDraft.address}
                            onChange={e => setProfileDraft({...profileDraft, address: e.target.value})}
                            placeholder="Ghar/mohalla, tehsil, district, HP" rows={2} />
                        </label>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div>
                      <div className="hgSectionLabel">Vehicle Details</div>
                      <div className="hgFieldGrid">

                        <label>
                          <span className="hgFieldLabel">Vehicle Type</span>
                          <select className="hgFieldSelect" value={profileDraft.vehicleType}
                            onChange={e => setProfileDraft({...profileDraft, vehicleType: e.target.value})}>
                            <option value="hatchback">Hatchback</option>
                            <option value="sedan">Sedan</option>
                            <option value="suv">SUV</option>
                            <option value="traveller">Traveller</option>
                            <option value="other">Other</option>
                          </select>
                        </label>

                        <label>
                          <span className="hgFieldLabel">Registration Number</span>
                          <input className="hgFieldInput" value={profileDraft.registrationNumber}
                            onChange={e => setProfileDraft({...profileDraft, registrationNumber: e.target.value.toUpperCase()})}
                            placeholder="HP01DA0000"
                            style={{ fontFamily:"monospace", letterSpacing:"1px" }} />
                        </label>

                        <label>
                          <span className="hgFieldLabel">Brand</span>
                          <input className="hgFieldInput" value={profileDraft.brand}
                            onChange={e => setProfileDraft({...profileDraft, brand: e.target.value})}
                            placeholder="Maruti, Tata, Hyundai..." />
                        </label>

                        <label>
                          <span className="hgFieldLabel">Model</span>
                          <input className="hgFieldInput" value={profileDraft.model}
                            onChange={e => setProfileDraft({...profileDraft, model: e.target.value})}
                            placeholder="Swift Dzire, Nexon..." />
                        </label>

                        <label>
                          <span className="hgFieldLabel">Fuel Type</span>
                          <select className="hgFieldSelect" value={profileDraft.fuelType}
                            onChange={e => setProfileDraft({...profileDraft, fuelType: e.target.value})}>
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="cng">CNG</option>
                            <option value="electric">Electric</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </label>

                        <label>
                          <span className="hgFieldLabel">Color</span>
                          <input className="hgFieldInput" value={profileDraft.color}
                            onChange={e => setProfileDraft({...profileDraft, color: e.target.value})}
                            placeholder="White, Silver..." />
                        </label>

                        {/* Commercial */}
                        <label className="hgCommercialRow full">
                          <input type="checkbox"
                            checked={Boolean(profileDraft.isCommercial)}
                            onChange={e => setProfileDraft({...profileDraft, isCommercial: e.target.checked})} />
                          <div>
                            <strong>🟡 Commercial / Yellow Plate Vehicle</strong>
                            <small>HimRideG par sirf commercial vehicles allowed hain</small>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="hgProfileFooter">
                    <button type="button" className="hgBtnCancel" onClick={() => setProfileOpen(false)}>Cancel</button>
                    <button type="submit" className="hgBtnSave" disabled={profileSaving}>
                      {profileSaving ? "Saving..." : "💾 Save Profile"}
                    </button>
                  </div>
                </form>
              )}

              {/* ══════ WALLET TAB — ADD-ONLY ══════ */}
              {profileTab === "wallet" && (
                <div className="hgDriverWalletProfileTab">
                  <section className="hgDriverWalletHero">
                    <div>
                      <small>AVAILABLE BALANCE</small>
                      <strong>₹{realDriverWalletBalance.toFixed(0)}</strong>
                    </div>
                    <div>
                      <small>TOTAL EARNINGS</small>
                      <strong>₹{Number(
                        walletData?.wallet?.totalEarned ??
                          driverWallet.totalEarned ??
                          0
                      ).toFixed(0)}</strong>
                    </div>
                    <div>
                      <small>PENDING</small>
                      <strong>₹{realDriverPendingAmount.toFixed(0)}</strong>
                    </div>
                  </section>

                  <div className="hgDriverWalletActions">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setEarningsOpen(true);
                      }}
                    >
                      💸 Withdraw / Wallet Settings
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWalletQrOpen(
                          true
                        )
                      }
                    >
                      ▦ My Driver QR
                    </button>
                    <button
                      type="button"
                      disabled={walletLoading}
                      onClick={loadWallet}
                    >
                      {walletLoading
                        ? "Refreshing..."
                        : "↻ Refresh"}
                    </button>
                  </div>

                  <section className="hgDriverWalletHistory">
                    <header>
                      <div>
                        <small>WALLET</small>
                        <h3>Transaction History</h3>
                      </div>
                    </header>

                    <div className="hgDriverWalletFilters">
                      {[
                        ["all","All"],
                        ["pending","Pending"],
                        ["completed","Completed"],
                        ["failed","Failed"]
                      ].map(
                        ([
                          value,
                          label
                        ]) => (
                          <button
                            type="button"
                            key={value}
                            className={
                              walletHistoryFilter ===
                              value
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              setWalletHistoryFilter(
                                value
                              )
                            }
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>

                    <div className="hgDriverWalletTransactionList">
                      {filteredDriverWalletTransactions.length > 0 ? (
                        filteredDriverWalletTransactions.map(
                          (
                            transaction,
                            index
                          ) => {
                            const status =
                              getDriverWalletTransactionStatus(
                                transaction
                              );

                            const direction =
                              String(
                                transaction?.direction ||
                                  ""
                              )
                                .trim()
                                .toLowerCase();

                            const prefix =
                              direction ===
                              "credit"
                                ? "+"
                                : direction ===
                                    "debit"
                                  ? "−"
                                  : "";

                            return (
                              <article
                                key={
                                  transaction?._id ||
                                  `${
                                    transaction?.referenceId ||
                                    "wallet"
                                  }-${
                                    transaction?.createdAt ||
                                    index
                                  }`
                                }
                              >
                                <span className={`hgDriverWalletTxIcon ${status}`}>
                                  {direction === "credit"
                                    ? "₹"
                                    : direction === "debit"
                                      ? "↗"
                                      : "•"}
                                </span>

                                <div>
                                  <strong>
                                    {transaction?.description ||
                                      "Wallet transaction"}
                                  </strong>
                                  <small>
                                    {formatDate(
                                      transaction?.createdAt
                                    )}
                                  </small>
                                </div>

                                <div className="hgDriverWalletTxAmount">
                                  <b className={direction}>
                                    {prefix}₹{Number(
                                      transaction?.amount ||
                                        0
                                    ).toFixed(0)}
                                  </b>
                                  <em className={status}>
                                    {status === "completed"
                                      ? "Completed"
                                      : status === "pending"
                                        ? "Pending"
                                        : "Failed"}
                                  </em>
                                </div>
                              </article>
                            );
                          }
                        )
                      ) : (
                        <div className="hgDriverWalletEmpty">
                          Is filter me abhi koi transaction nahi hai.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* ══════ DRIVER SUMMARY TAB — ADD-ONLY ══════ */}
              {profileTab === "summary" && (
                <div className="hgDriverProfileSummaryTab">
                  <div className="hgDriverProfileSummaryGrid">
                    <article>
                      <span>🚕</span>
                      <small>Total Requests</small>
                      <strong>{displayBookings.length}</strong>
                    </article>
                    <article>
                      <span>⏳</span>
                      <small>Pending</small>
                      <strong>{pendingRides}</strong>
                    </article>
                    <article>
                      <span>✅</span>
                      <small>Accepted</small>
                      <strong>{acceptedRides}</strong>
                    </article>
                    <article>
                      <span>🛣️</span>
                      <small>Ongoing</small>
                      <strong>{startedRides}</strong>
                    </article>
                    <article>
                      <span>💳</span>
                      <small>Waiting Payment</small>
                      <strong>{waitingPaymentRides}</strong>
                    </article>
                    <article>
                      <span>🏁</span>
                      <small>Completed</small>
                      <strong>{completedRides}</strong>
                    </article>
                    <article>
                      <span>⭐</span>
                      <small>Rating</small>
                      <strong>
                        {Number(
                          driverView?.driverProfile?.rating ||
                            0
                        ).toFixed(1)}
                      </strong>
                    </article>
                    <article>
                      <span>₹</span>
                      <small>Total Earnings</small>
                      <strong>
                        ₹{Number(
                          walletData?.wallet?.totalEarned ??
                            driverWallet.totalEarned ??
                            0
                        ).toFixed(0)}
                      </strong>
                    </article>
                    <article>
                      <span>💰</span>
                      <small>Wallet Balance</small>
                      <strong>
                        ₹{realDriverWalletBalance.toFixed(0)}
                      </strong>
                    </article>
                  </div>

                  <div className="hgDriverProfileSummaryActions">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileTab(
                          "wallet"
                        )
                      }
                    >
                      💰 Open Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setActiveTab("active");
                      }}
                    >
                      🚕 View My Rides
                    </button>
                  </div>
                </div>
              )}

              {/* ══════ DOCUMENTS TAB ══════ */}
              {profileTab === "documents" && (
                <div style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0, overflow:"hidden" }}>
                  <div className="hgProfileBody">
                    <p className="hgDocHelp">JPG, PNG, WEBP ya PDF • Max 5MB • Upload ke baad Admin verify karega</p>

                    {DRIVER_DOCUMENT_TYPES
                      .filter(([documentType]) => !HIDDEN_DRIVER_DOCUMENT_TYPES.has(documentType))
                      .map(([documentType, fallbackLabel]) => {
                      const meta = DOC_META[documentType] || { icon:"📄", label: fallbackLabel };
                      const doc = driverDocuments.find(d => d.documentType === documentType);
                      const status = doc?.verificationStatus || "not_uploaded";
                      const isVerified   = status === "verified";
                      const isRejected   = status === "rejected";
                      const isPending    = status === "pending";
                      const isNotUploaded = status === "not_uploaded";

                      const statusMap = {
                        not_uploaded: { dot:"⚪", text:"Not Uploaded",        color:"#888"    },
                        pending:      { dot:"🟡", text:"Pending Admin Review", color:"#f5c518" },
                        verified:     { dot:"🟢", text:"Verified",             color:"#22c55e" },
                        rejected:     { dot:"🔴", text:"Rejected",             color:"#ef4444" },
                      };
                      const sm = statusMap[status] || { dot:"⚪", text:status, color:"#888" };

                      const handleView = async () => {
                        if (!doc?._id) return;
                        try {
                          const token = sessionStorage.getItem("himrideg_token") ||
                            sessionStorage.getItem("accessToken") || "";
                          const host = window.location.hostname || "localhost";
                          const legacyDevelopmentUrl = `${apiBaseUrl}/driver/documents/${doc._id}/file`;
                          const productionDocumentUrl = `${apiBaseUrl}/driver/documents/${doc._id}/file`;
                          const url = import.meta.env.PROD
                            ? productionDocumentUrl
                            : legacyDevelopmentUrl;
                          const resp = await fetch(url, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
                          if (!resp.ok) throw new Error("Fetch failed " + resp.status);
                          const blob = await resp.blob();
                          window.open(URL.createObjectURL(blob), "_blank");
                        } catch (e) { alert("Document open nahi ho saka: " + e.message); }
                      };

                      return (
                        <div key={documentType} className={`hgDocCard${isVerified ? " verified" : isRejected ? " rejected" : isPending ? " pending" : ""}`}>
                          <div className="hgDocIcon">{meta.icon}</div>

                          <div className="hgDocInfo">
                            <strong>{meta.label}</strong>
                            <div className="hgDocStatusRow">
                              <span className="hgDocStatusDot">{sm.dot}</span>
                              <span className="hgDocStatusText" style={{ color:sm.color }}>{sm.text}</span>
                            </div>
                            {isRejected && doc?.rejectionReason && (
                              <div className="hgDocRejection">Reason: {doc.rejectionReason}</div>
                            )}
                          </div>

                          <div className="hgDocActions">
                            {isVerified && <span className="hgDocVerifiedBadge">🔒 Verified</span>}
                            {(isPending || isVerified) && doc?.documentUrl && (
                              <button type="button" className="hgDocViewBtn" onClick={handleView}>👁 View</button>
                            )}
                            {!isVerified && (
                              <label
                                className={`hgDocUploadLabel ${isNotUploaded ? "upload" : isRejected ? "reupload" : "replace"}`}
                                aria-disabled={Boolean(uploadingDocument) ? "true" : undefined}
                              >
                                {uploadingDocument === documentType ? "Uploading..."
                                  : isRejected ? "📤 Upload Again"
                                  : isPending ? "🔄 Replace"
                                  : "📤 Upload"}
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                                  disabled={Boolean(uploadingDocument)}
                                  onChange={e => { uploadDriverDocument(documentType, e.target.files?.[0]); e.target.value=""; }} />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hgProfileFooterClose">
                    <button type="button" className="hgBtnCancel" style={{ width:"100%" }} onClick={() => setProfileOpen(false)}>Close</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {!showDocGate && !showUnderReview && (<div style={{display:"contents"}}><header className="driverTopbar driverCustomerStyleTopbar">
        <div className="driverBrand">
          <div className="driverLogo">HG</div>
          <div>
            <p className="driverBrandTag">HIMACHAL KI APNI RIDE</p>
            <h1>HimRideG Driver</h1>
          </div>
        </div>

        <nav className="driverDesktopNav">
          <button className={activeTab === "dashboard" ? "active" : ""} type="button" onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab === "requests" ? "active" : ""} type="button" onClick={() => setActiveTab("requests")}>Requests</button>
          <button className={["active", "scheduled", "payment", "completed"].includes(activeTab) ? "active" : ""} type="button" onClick={() => setActiveTab("active")}>My Rides</button>
          <button type="button" onClick={() => setEarningsOpen(true)}>💰 Wallet</button>
          <button type="button" onClick={() => setWalletQrOpen(true)}>My QR</button>
          <button
            type="button"
            onClick={() => {
              setProfileTab("hub");
              setProfileOpen(true);
            }}
          >
            Profile
          </button>
        </nav>

        <div className="driverHeaderProfile">
          <button type="button" className="driverBellButton" aria-label="Ride notifications" onClick={() => setActiveTab("requests")}>🔔{pendingRides > 0 && <b>{pendingRides}</b>}</button>
          <div className="driverOnlineControl">
            <span>{driverStatus.isOnline ? (driverStatus.isAvailable ? "Online • Available" : "Online • Busy") : "Go Online"}</span>
            <button
              type="button"
              aria-label="Toggle online status"
              className={`driverOnlineSwitch ${driverStatus.isOnline ? "online" : ""}`}
              disabled={driverStatus.loading}
              onClick={() => updateDriverOnlineStatus?.(!driverStatus.isOnline)}
            ><i /></button>
          </div>
          <button
            type="button"
            className="driverHeaderAvatar"
            onClick={() => {
              setProfileTab("hub");
              setProfileOpen(true);
            }}
          >
            {driverView?.profileImage ? <img src={driverView.profileImage} alt={displayDriverName} /> : (displayDriverName.charAt(0).toUpperCase() || "D")}
          </button>
          <div className="driverHeaderUser"><strong>{displayDriverName}</strong><span>Driver account</span></div>
          <button type="button" className="driverLogoutButton" onClick={() => { if (socket.connected) socket.disconnect(); logout?.(); }}>Logout</button>
        </div>
      </header>

      <main className="driverDashboardContent driverCustomerStylePage">
        {activeTab === "dashboard" ? (
          <>
            <section className="driverHeroBanner">
              <div>
                <small>DRIVER DASHBOARD</small>
                <h2>Namaste, <span>{displayDriverName}</span></h2>
                <p>Online raho, ride accept karo aur apna final fare khud decide karo.</p>
              </div>
              <div className="driverHeroActions">
                <span className={approved ? "approved" : "waiting"}>{approved ? "✓ Approved Driver" : "Approval Pending"}</span>
                <button
                  type="button"
                  className="driverHeroWalletButton"
                  onClick={() => setEarningsOpen(true)}
                >
                  💰 Wallet
                </button>
                <button type="button" onClick={() => setSummaryOpen(true)}>▥ Driver Summary</button>
              </div>
            </section>

            <section className="driverCustomerGrid">
              <aside className="driverCustomerRideCard">
                <header>
                  <div><small>NEW RIDE REQUEST</small><h2>{selectedRide ? "Ride Details" : "Ride Requests"}</h2></div>
                  <button type="button" onClick={loadBookings}>↻</button>
                </header>

                {!selectedRide ? (
                  <div className="driverRequestCompactList">
                    {tabRides.length ? (
                      <>
                        <p className="driverRequestListHint">Ride request par tap karo. Accept / Reject sirf details open hone ke baad aayega.</p>
                        {tabRides.slice(0, 10).map((ride) => {
                          const rideId = getId(ride);

                          return (
                            <button
                              type="button"
                              className="driverRequestCompactItem"
                              key={rideId}
                              onClick={() => setSelectedRideId(rideId)}
                            >
                              <span className="driverRequestCompactRoute">
                                <small>CUSTOMER</small>
                                <strong style={{color:"#f5c518",fontWeight:900}}>{getCustomerName(ride)}</strong>
                                <small>PICKUP</small>
                                <strong>{getPickupName(ride)}</strong>
                                <small>DROP</small>
                                <strong>{getDropName(ride)}</strong>
                              </span>

                              <span className="driverRequestCompactMeta">
                                <b>{formatDistance(getDistance(ride))}</b>
                                <em>{getDriverRideStatusLabel(ride)}</em>
                                {(ride?.requestPreviewOnly === true || ride?.actionsLocked === true) ? (
                                  <i style={{color:"#f5c518"}}>🔒 Preview only</i>
                                ) : (
                                  <i>Tap to view →</i>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </>
                    ) : latestWaitingPaymentRide ? (
                      <div className="driverCustomerEmpty driverWaitingPaymentState">
                        <span>💳</span>
                        <strong>{isCashSelectedForRide(latestWaitingPaymentRide) ? "Cash Payment Selected" : "Waiting for Payment"}</strong>
                        <p>
                          {isCashSelectedForRide(latestWaitingPaymentRide)
                            ? "Customer ne Cash Payment select ki hai. Cash physically receive hone ke baad confirm karein."
                            : "Ride complete hai. Customer Cash select kare ya na kare, cash physically milte hi Receive Cash confirm karein."}
                        </p>
                        <b style={{color:"#f5c518",fontSize:"24px"}}>
                          ₹{Number(getFinalFare(latestWaitingPaymentRide) || 0).toFixed(0)}
                        </b>
                        {canConfirmCashForRide(latestWaitingPaymentRide) ? (
                          <button
                            type="button"
                            className="accept"
                            disabled={Boolean(loadingAction)}
                            onClick={() => confirmCashReceived(latestWaitingPaymentRide)}
                            style={{marginTop:"12px"}}
                          >
                            💵 Receive Cash ₹{Number(getFinalFare(latestWaitingPaymentRide) || 0).toFixed(0)}
                          </button>
                        ) : (
                          <small style={{marginTop:"10px",color:"#9fb0c2"}}>
                            {String(latestWaitingPaymentRide.paymentChoiceAfterRide || "").toLowerCase() === "online"
                              ? "Online payment successful hote hi Receive Cash option automatically hat jayega."
                              : "Cash physically mile tabhi Receive Cash confirm karein."}
                          </small>
                        )}
                      </div>
                    ) : (
                      <div className="driverCustomerEmpty">
                        <span>🚖</span>
                        <strong>Waiting for New Ride</strong>
                        <p>Online raho. Nayi customer booking yahin list me dikhai degi.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="driverCustomerRideBody">
                    <div className="driverCustomerRow">
                      <div className="driverCustomerAvatar">{getCustomerName(selectedRide).charAt(0).toUpperCase()}</div>
                      <div><strong>{getCustomerName(selectedRide)}</strong><small>{getDriverRideStatusLabel(selectedRide)}</small></div>
                      {getCustomerPhone(selectedRide) !== "Not available" && <a href={`tel:${getCustomerPhone(selectedRide)}`}>☎</a>}
                    </div>

                    <div className="driverCustomerRoute">
                      <div><i className="pickup"/><span><small>PICKUP</small><strong>{getPickupName(selectedRide)}</strong></span></div>
                      <div><i className="drop"/><span><small>DROP</small><strong>{getDropName(selectedRide)}</strong></span></div>
                    </div>

                    <div className="driverCustomerFacts">
                      <article><small>DISTANCE</small><strong>{formatDistance(getDistance(selectedRide))}</strong></article>
                      <article><small>PASSENGERS</small><strong>{getPassengerCount(selectedRide)}</strong></article>
                    </div>

                    {selectedAssignedToMe && ["accepted","fare_offered","negotiating","fare_accepted"].includes(selectedRide.status) && (
                      <section className="driverCustomerFareCard">
                        <header><div><small>FARE NEGOTIATION</small><h3>Driver → Customer → Final</h3></div><b>{Math.min(Number(selectedRide.fareOfferCount || 0), 3)}/3 Steps</b></header>
                        {selectedFareStage === "fare_accepted" ? (
                          <div className="driverCustomerFareFinal">
                            <article><small>FINAL FARE</small><strong>₹{getFinalFare(selectedRide).toFixed(0)}</strong></article>
                            <article><small>COMMISSION</small><strong>₹{getCommissionAmount(selectedRide).toFixed(0)}</strong></article>
                            <article><small>YOUR EARNING</small><strong>₹{getDriverPayable(selectedRide).toFixed(0)}</strong></article>
                          </div>
                        ) : selectedFareStage === "driver_final" ? (
                          <div className="driverCustomerCounter driverFinalFarePendingCard">
                            <p>📨 FINAL FARE SENT</p>
                            <strong>₹{selectedDriverFinalFare.toFixed(0)}</strong>
                            <small style={{display:"block",marginTop:"8px",color:"#aab0b8"}}>Final offer customer ko bhej diya hai. Fare sirf customer ke Accept karne ke baad LOCK hoga.</small>
                            <button
                              type="button"
                              className="driverFinalCancelButton"
                              disabled={Boolean(loadingAction)}
                              onClick={() => releaseAcceptedRide(selectedRide)}
                            >
                              {loadingAction === `${selectedRideIdValue}:release` ? "Cancelling..." : "× Cancel Ride"}
                            </button>
                          </div>
                        ) : selectedFareStage === "driver_final_recovery" ? (
                          <div className="driverCustomerCounter">
                            <p style={{color:"#ffb020",fontWeight:900}}>⚠ FINAL Fare Sync Recovery</p>
                            <strong>Customer Counter ₹{selectedCustomerCounterFare.toFixed(0)}</strong>
                            <small style={{display:"block",marginTop:"8px",color:"#aab0b8",lineHeight:1.55}}>Final fare status save hua tha lekin amount missing/₹0 mila. Customer ko ₹0 kabhi nahi bheja jayega. Apna FINAL fare dobara bhejein; valid amount save hote hi customer ko sirf Accept / Reject milega.</small>
                            <div className="driverCustomerFareInput" style={{marginTop:"12px"}}>
                              <span>₹</span>
                              <input
                                type="number"
                                min="50"
                                max="10000"
                                placeholder="FINAL fare resend kare"
                                value={fareInputs[selectedRideIdValue] ?? ""}
                                onChange={(event) => setFareInputs((current) => ({...current,[selectedRideIdValue]: event.target.value}))}
                              />
                              <button
                                type="button"
                                disabled={Boolean(fareAction)}
                                onClick={() => sendDriverFare(selectedRide)}
                              >
                                Resend Final Fare
                              </button>
                            </div>
                          </div>
                        ) : selectedFareStage === "customer_countered" ? (
                          <div className="driverCustomerCounter">
                            <p>Customer One-Time Counter</p>
                            <strong>₹{selectedCustomerCounterFare.toFixed(0)}</strong>
                            <small style={{display:"block",marginTop:"8px",color:"#aab0b8"}}>Ab aap ek FINAL fare bhejein. Iske baad customer dashboard par sirf Accept / Reject aayega.</small>
                            <div className="driverCustomerFareInput" style={{marginTop:"12px"}}>
                              <span>₹</span>
                              <input
                                type="number"
                                min="50"
                                max="10000"
                                placeholder="Driver FINAL fare enter kare"
                                value={fareInputs[selectedRideIdValue] ?? ""}
                                onChange={(event) => setFareInputs((current) => ({...current,[selectedRideIdValue]: event.target.value}))}
                              />
                              <button
                                type="button"
                                disabled={Boolean(fareAction)}
                                onClick={() => sendDriverFare(selectedRide)}
                              >
                                Send Final Fare
                              </button>
                            </div>
                          </div>
                        ) : selectedFareStage === "driver_offered" ? (
                          <div className="driverCustomerCounter">
                            <p>Initial Fare Sent</p>
                            <strong>₹{selectedDriverInitialFare.toFixed(0)}</strong>
                            <small style={{display:"block",marginTop:"8px",color:"#aab0b8"}}>Customer ab is fare ko Accept, Reject ya ek baar Counter Offer kar sakta hai. Initial fare dobara send nahi hoga.</small>
                          </div>
                        ) : (
                          <div className="driverCustomerFareInput">
                            <span>₹</span>
                            <input
                              type="number"
                              min="50"
                              max="10000"
                              placeholder="Apna initial fare enter kare"
                              value={fareInputs[selectedRideIdValue] ?? ""}
                              onChange={(event) => setFareInputs((current) => ({...current,[selectedRideIdValue]: event.target.value}))}
                            />
                            <button
                              type="button"
                              disabled={Boolean(fareAction)}
                              onClick={() => sendDriverFare(selectedRide)}
                            >
                              Send Fare
                            </button>
                          </div>
                        )}
                        {selectedFareStage === "driver_final" && (
                          <div className="driverFareWaitLarge">⏳ Customer ke final Accept / Reject ka wait</div>
                        )}
                        {selectedFareStage === "driver_final_recovery" && (
                          <div className="driverFareWaitLarge">⚠ ₹0 final fare invalid hai — recovery fare resend karein</div>
                        )}
                        {selectedFareStage === "driver_offered" && (
                          <div className="driverFareWaitLarge">⏳ Customer ke Accept / Reject / Counter ka wait</div>
                        )}
                      </section>
                    )}

                    {selectedPreviewLocked && (
                      <div
                        style={{
                          marginTop:"14px",
                          padding:"12px 14px",
                          borderRadius:"12px",
                          border:"1px solid rgba(245,197,24,.34)",
                          background:"rgba(245,197,24,.07)",
                          color:"#f5c518",
                          fontWeight:800,
                          fontSize:"12px"
                        }}
                      >
                        🔒 Current ride active hai. Ye next ride preview hai; current ride complete hone ke baad hi Accept / Reject available hoga.
                      </div>
                    )}

                    {(selectedCanAccept || selectedCanReject) && (
                      <div className="driverCustomerAcceptRow">
                        {selectedCanAccept && <button type="button" className="accept" disabled={Boolean(loadingAction)} onClick={() => acceptRide(selectedRide)}>✓ Accept Ride</button>}
                        {selectedCanReject && <button type="button" className="reject" disabled={Boolean(loadingAction)} onClick={() => rejectRide(selectedRide)}>× Reject Ride</button>}
                      </div>
                    )}
                  </div>
                )}
              </aside>

              <section className="driverCustomerMapCard">
                <header>
                  <div>
                    <small>{selectedRide ? "LIVE ROUTE" : latestWaitingPaymentRide ? "PAYMENT STATUS" : "LIVE ROUTE"}</small>
                    <h2>{selectedRide ? "Pickup to Destination" : latestWaitingPaymentRide ? (isCashSelectedForRide(latestWaitingPaymentRide) ? "Cash Payment Selected" : "Waiting for Payment") : "Route Map"}</h2>
                  </div>
                  {selectedRide && <span>{getDriverRideStatusLabel(selectedRide)}</span>}
                  {!selectedRide && latestWaitingPaymentRide && <span>{isCashSelectedForRide(latestWaitingPaymentRide) ? "Cash Selected" : "Receive Cash Ready"}</span>}
                </header>
                <div className="driverCustomerMapStage">
                  {selectedRide ? (
                    <DriverRideMap ride={selectedRide}/>
                  ) : latestWaitingPaymentRide ? (
                    <div className="driverCustomerEmpty driverWaitingPaymentState">
                      <span>💵</span>
                      <strong>{isCashSelectedForRide(latestWaitingPaymentRide) ? "Cash Payment Selected" : "Waiting for Payment"}</strong>
                      <p>
                        {isCashSelectedForRide(latestWaitingPaymentRide)
                          ? `Customer ne ₹${Number(getFinalFare(latestWaitingPaymentRide) || 0).toFixed(0)} Cash Payment select ki hai. Cash physically milne ke baad Receive Cash dabayein.`
                          : `Ride complete hai. ₹${Number(getFinalFare(latestWaitingPaymentRide) || 0).toFixed(0)} cash physically milte hi Receive Cash dabayein; online payment successful hote hi ye action khud hat jayega.`}
                      </p>
                      {canConfirmCashForRide(latestWaitingPaymentRide) ? (
                        <button
                          type="button"
                          className="driverCashReceivedPrimary"
                          disabled={Boolean(loadingAction)}
                          onClick={() => confirmCashReceived(latestWaitingPaymentRide)}
                        >
                          {loadingAction === `${getId(latestWaitingPaymentRide)}:cash-confirm`
                            ? "Confirming..."
                            : `💵 Receive Cash ₹${Number(getFinalFare(latestWaitingPaymentRide) || 0).toFixed(0)}`}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="driverCustomerEmpty"><span>🗺️</span><strong>Waiting for Ride</strong></div>
                  )}
                </div>
                {selectedRide && (
                  <div className="driverCustomerMapActions">
                    {selectedRideActionsEnabled ? (
                      <>
                        <a href={createNavigationUrl(getPickupCoordinates(selectedRide))} target="_blank" rel="noreferrer">➤ Navigate Pickup</a>
                        <a href={createNavigationUrl(getDropCoordinates(selectedRide))} target="_blank" rel="noreferrer">➤ Navigate Destination</a>
                      </>
                    ) : (
                      <>
                        <span className="driverActionLinkDisabled">🔒 Navigate Pickup</span>
                        <span className="driverActionLinkDisabled">🔒 Navigate Destination</span>
                      </>
                    )}
                    <button type="button" onClick={() => setSelectedRideId(selectedRideIdValue)}>₹ Fare Negotiation</button>
                    {selectedFareLocked && (
                      <button type="button" onClick={() => setDriverPaymentModalRide(selectedRide)}>
                        💳 Payment Status
                      </button>
                    )}
                  </div>
                )}
                {selectedRide && selectedAssignedToMe && (
                  <div className="driverCustomerRideActions">
                    {!selectedFareLocked && (
                      <>
                        <button type="button" className="waiting" disabled>
                          🔒 Customer Fare Accept Hone Tak GO TO PICKUP Disabled
                        </button>
                        {["accepted", "fare_offered", "negotiating"].includes(String(selectedRide.status || "")) ? (
                          <button
                            type="button"
                            className="danger"
                            disabled={Boolean(loadingAction)}
                            onClick={() => releaseAcceptedRide(selectedRide)}
                          >
                            {loadingAction === `${selectedRideIdValue}:release` ? "Cancelling..." : "× Cancel Ride"}
                          </button>
                        ) : (
                          <button type="button" className="danger" disabled>
                            🔒 Cancel Ride Unavailable
                          </button>
                        )}
                      </>
                    )}

                    {selectedFareLocked && selectedAdvancePending && (
                      <button type="button" className="waiting" disabled>
                        🔒 Advance Payment Pending — Customer Pay Now Kare
                      </button>
                    )}

                    {selectedRide.status === "fare_accepted" && (
                      <button
                        type="button"
                        disabled={!selectedRideActionsEnabled || Boolean(loadingAction)}
                        onClick={() => markArriving(selectedRide)}
                      >
                        🚕 Go to Pickup
                      </button>
                    )}

                    {selectedRide.status === "driver_arriving" && (
                      <button
                        type="button"
                        disabled={!selectedRideActionsEnabled || Boolean(loadingAction)}
                        onClick={() => markArrived(selectedRide)}
                      >
                        📍 I Have Arrived
                      </button>
                    )}

                    {selectedRide.status === "driver_arrived" && (
                      <button
                        type="button"
                        disabled={!selectedRideActionsEnabled || Boolean(loadingAction)}
                        onClick={() => { setOtpRide(selectedRide); setOtp(""); }}
                      >
                        🔐 Enter Customer OTP
                      </button>
                    )}

                    {selectedRide.status === "started" && (
                      <button
                        type="button"
                        className="complete"
                        disabled={!selectedRideActionsEnabled || Boolean(loadingAction)}
                        onClick={() => completeRide(selectedRide)}
                      >
                        🏁 Complete Ride
                      </button>
                    )}
                  </div>
                )}
              </section>

              <aside className="driverCustomerSummary">
                <header><div><small>TODAY'S SUMMARY</small><h2>Driver Summary</h2></div><button type="button" onClick={() => setSummaryOpen(true)}>☰</button></header>
                <article><span>🚕</span><div><small>Total Rides</small><strong>{displayBookings.length}</strong></div></article>
                <article><span>💳</span><div><small>Waiting Payment</small><strong>{waitingPaymentRides}</strong></div></article>
                <article><span>✅</span><div><small>Completed</small><strong>{completedRides}</strong></div></article>
                <article><span>🛣️</span><div><small>Active</small><strong>{acceptedRides + startedRides}</strong></div></article>
                <article><span>₹</span><div><small>Total Earnings</small><strong>₹{Number(driverWallet.totalEarned || 0).toFixed(0)}</strong></div></article>
                <button type="button" className="driverCustomerSummaryBtn" onClick={() => setSummaryOpen(true)}>View Full Summary →</button>
                <button
                  type="button"
                  className="driverCustomerSummaryBtn driverCustomerWalletBtn"
                  onClick={() => setEarningsOpen(true)}
                >
                  💰 Open Driver Wallet · ₹{realDriverWalletBalance.toFixed(0)}
                </button>
              </aside>
            </section>
          </>
        ) : (
          <section className="driverRidesPage">
            <header><div><small>DRIVER RIDES</small><h2>{activeTab === "requests" ? "New Requests" : "My Rides"}</h2></div><button type="button" onClick={() => setActiveTab("dashboard")}>← Dashboard</button></header>
            <div className="driverRideTabs">
              {[["requests","New Requests"],["scheduled","Scheduled"],["active","Active"],["payment","Waiting Payment"],["completed","Completed"]].map(([value,label]) => <button type="button" key={value} className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)}>{label}</button>)}
            </div>
            <div className="driverRidesList">
              {tabRides.length ? tabRides.map((ride) => {
                const rideId = getId(ride);

                const completedDetailsOpen =
                  ["completed", "payment"].includes(activeTab) &&
                  completedRideOpenId === rideId;

                return (
                  <article
                    key={rideId}
                    onClick={() => {
                      if (
                        ["completed", "payment"].includes(activeTab)
                      ) {
                        setCompletedRideOpenId(
                          completedDetailsOpen
                            ? ""
                            : rideId
                        );

                        return;
                      }

                      setSelectedRideId(
                        rideId
                      );

                      setActiveTab(
                        "dashboard"
                      );
                    }}
                  >
                    <strong>
                      {formatDate(
                        ride.travelDate ||
                          ride.createdAt
                      )}
                    </strong>

                    <span>
                      <i className="pickup"/>

                      {getPickupName(
                        ride
                      )}
                    </span>

                    <span>
                      <i className="drop"/>

                      {getDropName(
                        ride
                      )}
                    </span>

                    <b>
                      ₹{
                        getFinalFare(
                          ride
                        ) ||
                        getEstimatedFare(
                          ride
                        )
                      }
                    </b>

                    <button
                      type="button"
                    >
                      {
                        completedDetailsOpen
                          ? "Hide Details"
                          : "View Details"
                      }
                    </button>

                    {
                      completedDetailsOpen &&
                      (
                        <div
                          style={{
                            gridColumn:
                              "1 / -1",

                            width:
                              "100%",

                            padding:
                              "14px",

                            marginTop:
                              "8px",

                            borderRadius:
                              "14px",

                            background:
                              "rgba(255,255,255,0.06)"
                          }}
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          <p>
                            <strong>
                              Customer:
                            </strong>
                            {" "}
                            {
                              getCustomerName(
                                ride
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Phone:
                            </strong>
                            {" "}
                            {
                              getCustomerPhone(
                                ride
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Pickup:
                            </strong>
                            {" "}
                            {
                              getPickupName(
                                ride
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Drop:
                            </strong>
                            {" "}
                            {
                              getDropName(
                                ride
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Distance:
                            </strong>
                            {" "}
                            {
                              formatDistance(
                                getDistance(
                                  ride
                                )
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Final Fare:
                            </strong>
                            {" "}
                            ₹{
                              Number(
                                getFinalFare(
                                  ride
                                ) ||
                                getEstimatedFare(
                                  ride
                                ) ||
                                0
                              ).toFixed(
                                0
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>
                            {" "}
                            {getDriverRideStatusLabel(ride)}
                          </p>

                          <p>
                            <strong>
                              Completed:
                            </strong>
                            {" "}
                            {
                              formatDate(
                                ride.completedAt ||
                                  ride.updatedAt ||
                                  ride.createdAt
                              )
                            }
                          </p>

                          {canConfirmCashForRide(ride) &&
                            !(["paid", "completed"].includes(String(ride.paymentStatus || ride?.payment?.status || "").toLowerCase())) && (
                              <button
                                type="button"
                                className="accept"
                                disabled={Boolean(loadingAction)}
                                onClick={() => confirmCashReceived(ride)}
                                style={{marginTop:"10px"}}
                              >
                                💵 Receive Cash ₹{Number(getFinalFare(ride) || 0).toFixed(0)}
                              </button>
                            )}
                        </div>
                      )
                    }
                  </article>
                );
              }) : <div className="driverCustomerEmpty"><span>🚖</span><strong>Is section me koi ride nahi hai</strong></div>}
            </div>
          </section>
        )}

        {driverPaymentModalRide && (
          <DriverPaymentModal
            ride={driverPaymentModalRide}
            onClose={() => setDriverPaymentModalRide(null)}
          />
        )}

        {selectedRide && selectedAssignedToMe && LOCATION_TRACKING_STATUSES.includes(selectedRide.status) && <DriverLocationTracker bookingId={selectedRideIdValue} rideStatus={selectedRide.status}/>} 
      </main>
    </div>)}
    </div>
  );
}

export default DriverDashboard;