import React, {
  useEffect,
  useRef,
  useState
} from "react";

import api from "./api";

const TRACKABLE_STATUSES = [
  "accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

function DriverLocationTracker({
  bookingId,
  rideStatus
}) {
  const [message, setMessage] =
    useState("");

  const lastSentAtRef = useRef(0);

  useEffect(() => {
    if (!bookingId) {
      setMessage("");
      return undefined;
    }

    if (
      !TRACKABLE_STATUSES.includes(
        rideStatus
      )
    ) {
      setMessage("");
      return undefined;
    }

    if (!navigator.geolocation) {
      setMessage(
        "Is device me location support nahi hai."
      );

      return undefined;
    }

    let componentActive = true;

    setMessage(
      "📡 Live location start ho rahi hai..."
    );

    const sendLocation = async (
      position
    ) => {
      const now = Date.now();

      /*
      |--------------------------------------------------------------------------
      | Request Throttling
      |--------------------------------------------------------------------------
      | Har GPS callback par API request bhejne ki jagah minimum 5 seconds ka
      | interval rakha gaya hai.
      */

      if (
        now - lastSentAtRef.current <
        5000
      ) {
        return;
      }

      lastSentAtRef.current = now;

      const {
        latitude,
        longitude,
        heading,
        speed,
        accuracy
      } = position.coords;

      try {
        await api.patch(
          `/rides/${bookingId}/location`,
          {
            latitude,
            longitude,

            heading:
              Number.isFinite(heading)
                ? heading
                : null,

            speed:
              Number.isFinite(speed)
                ? speed
                : null,

            accuracy:
              Number.isFinite(accuracy)
                ? accuracy
                : null
          }
        );

        if (componentActive) {
          setMessage(
            "📍 Live location active"
          );
        }
      } catch (error) {
        if (!componentActive) {
          return;
        }

        setMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Location server par update nahi hui"
        );
      }
    };

    const watchId =
      navigator.geolocation.watchPosition(
        sendLocation,

        (error) => {
          if (!componentActive) {
            return;
          }

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setMessage(
              "Location permission allow karo."
            );

            return;
          }

          if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            setMessage(
              "Current location available nahi hai."
            );

            return;
          }

          if (
            error.code === error.TIMEOUT
          ) {
            setMessage(
              "Location request timeout ho gayi."
            );

            return;
          }

          setMessage(
            "Current location nahi mil rahi."
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000
        }
      );

    return () => {
      componentActive = false;

      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [bookingId, rideStatus]);

  if (!bookingId || !message) {
    return null;
  }

  return (
    <p className="locationMessage">
      {message}
    </p>
  );
}

export default DriverLocationTracker;