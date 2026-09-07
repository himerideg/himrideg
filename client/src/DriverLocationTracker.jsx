import React, {
  useEffect,
  useRef,
  useState
} from "react";

import api from "./api";
import socket from "./socket";

const TRACKABLE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "arrived",
  "started"
];

function DriverLocationTracker({
  bookingId,
  rideStatus
}) {
  const [message, setMessage] =
    useState("");

  const lastSentAtRef = useRef(0);
  const lastRestFallbackAtRef = useRef(0);
  const rideRoomReadyRef = useRef(false);

  /*
  |------------------------------------------------------------------------
  | V64 Realtime Ride Room Join
  |------------------------------------------------------------------------
  | Live GPS ka primary transport Socket.IO hai. Tracker khud assigned ride
  | room join karta hai taaki dashboard refresh/reconnect ke baad first GPS
  | point room-ready hone se pehle lose na ho.
  */
  useEffect(() => {
    rideRoomReadyRef.current = false;

    if (!bookingId) {
      return undefined;
    }

    const joinRideRoom = () => {
      socket.emit(
        "ride:join",
        { bookingId },
        (response) => {
          rideRoomReadyRef.current =
            response?.success !== false;
        }
      );
    };

    if (socket.connected) {
      joinRideRoom();
    }

    socket.on("connect", joinRideRoom);

    return () => {
      socket.off("connect", joinRideRoom);
      rideRoomReadyRef.current = false;
    };
  }, [bookingId]);

  useEffect(() => {
    /* V63: new/rehydrated ride ko first GPS point immediately bhejna. */
    lastSentAtRef.current = 0;

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

      const livePayload = {
        bookingId,
        rideStatus,
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
      };

      /*
      |--------------------------------------------------------------------
      | V64 Socket-first Live GPS
      |--------------------------------------------------------------------
      | Browser -> Socket -> customer map realtime. API timeout live marker
      | ko freeze nahi karega. REST sirf socket unavailable hone par fallback
      | hai, aur short timeout use karta hai.
      */
      if (socket.connected) {
        if (!rideRoomReadyRef.current) {
          socket.emit(
            "ride:join",
            { bookingId },
            (response) => {
              rideRoomReadyRef.current =
                response?.success !== false;
            }
          );
        }

        socket.emit(
          "driver:location:update",
          livePayload
        );

        if (componentActive) {
          setMessage(
            "📍 Live location active"
          );
        }

        return;
      }

      if (
        now - lastRestFallbackAtRef.current <
        10000
      ) {
        return;
      }

      lastRestFallbackAtRef.current = now;

      try {
        await api.patch(
          `/rides/${bookingId}/location`,
          livePayload,
          {
            timeout: 8000
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
            "Live socket reconnect ho raha hai..."
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