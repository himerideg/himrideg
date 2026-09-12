const Booking = require("../models/Booking");
const User = require("../models/User");

const AVAILABLE_RIDE_STATUSES = [
  "pending",
  "searching_driver"
];

const RECOVERY_WINDOW_MS =
  2 * 60 * 60 * 1000;

const MAX_RECOVERY_DISTANCE_KM = 100;
const MAX_RECOVERED_RIDES = 10;

function getId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        value.userId ||
        ""
    );
  }
  return String(value);
}

function getDriverCoordinates(driver) {
  const geo =
    driver?.currentLocation?.geo;

  if (
    geo?.type === "Point" &&
    Array.isArray(geo.coordinates) &&
    geo.coordinates.length >= 2
  ) {
    const longitude =
      Number(geo.coordinates[0]);
    const latitude =
      Number(geo.coordinates[1]);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return {
        latitude,
        longitude
      };
    }
  }

  const latitude =
    Number(
      driver?.currentLocation?.latitude ??
        driver?.currentLocation?.lat
    );
  const longitude =
    Number(
      driver?.currentLocation?.longitude ??
        driver?.currentLocation?.lng
    );

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return {
      latitude,
      longitude
    };
  }

  return null;
}

function getPickupCoordinates(ride) {
  const geo =
    ride?.pickup?.coordinates?.geo;

  if (
    geo?.type === "Point" &&
    Array.isArray(geo.coordinates) &&
    geo.coordinates.length >= 2
  ) {
    const longitude =
      Number(geo.coordinates[0]);
    const latitude =
      Number(geo.coordinates[1]);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return {
        latitude,
        longitude
      };
    }
  }

  const latitude =
    Number(
      ride?.pickup?.coordinates?.latitude ??
        ride?.pickup?.latitude
    );
  const longitude =
    Number(
      ride?.pickup?.coordinates?.longitude ??
        ride?.pickup?.longitude
    );

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return {
      latitude,
      longitude
    };
  }

  return null;
}

function distanceKm(first, second) {
  if (!first || !second) {
    return null;
  }

  const toRadians =
    (value) =>
      (Number(value) * Math.PI) /
      180;

  const earthRadiusKm = 6371;
  const deltaLatitude =
    toRadians(
      second.latitude -
        first.latitude
    );
  const deltaLongitude =
    toRadians(
      second.longitude -
        first.longitude
    );

  const firstLatitude =
    toRadians(first.latitude);
  const secondLatitude =
    toRadians(second.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

function normalizeBookings(payload) {
  if (Array.isArray(payload?.bookings)) {
    return payload.bookings;
  }

  if (
    Array.isArray(
      payload?.data?.bookings
    )
  ) {
    return payload.data.bookings;
  }

  return [];
}

function mergeBookings(
  existingBookings,
  recoveredBookings
) {
  const byId = new Map();

  existingBookings.forEach((ride) => {
    const id = getId(ride);
    if (id) byId.set(id, ride);
  });

  recoveredBookings.forEach((ride) => {
    const id = getId(ride);
    if (!id || byId.has(id)) {
      return;
    }

    byId.set(id, ride);
  });

  return Array.from(byId.values()).sort(
    (firstRide, secondRide) =>
      new Date(
        secondRide?.updatedAt ||
          secondRide?.createdAt ||
          0
      ).getTime() -
      new Date(
        firstRide?.updatedAt ||
          firstRide?.createdAt ||
          0
      ).getTime()
  );
}

async function enhanceDriverFeed(
  req,
  payload
) {
  if (
    req.user?.role !== "driver" ||
    payload?.success === false
  ) {
    return payload;
  }

  const driverId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (!driverId) {
    return payload;
  }

  const driver =
    await User.findOne({
      _id: driverId,
      role: "driver"
    }).select(
      "isOnline isAvailable currentRide currentLocation"
    );

  if (
    !driver ||
    !driver.isOnline ||
    !driver.isAvailable ||
    driver.currentRide
  ) {
    return payload;
  }

  const driverCoordinates =
    getDriverCoordinates(driver);

  const now = new Date();
  const createdAfter = new Date(
    now.getTime() -
      RECOVERY_WINDOW_MS
  );

  const staleCandidates =
    await Booking.find({
      driver: null,
      status: {
        $in: AVAILABLE_RIDE_STATUSES
      },
      createdAt: {
        $gte: createdAfter
      },
      rejectedDrivers: {
        $ne: driver._id
      },
      $nor: [
        {
          dispatchQueue: {
            $elemMatch: {
              status: "pending",
              expiresAt: {
                $gt: now
              }
            }
          }
        }
      ]
    })
      .sort({
        updatedAt: -1,
        createdAt: -1
      })
      .limit(50)
      .populate(
        "customer",
        "name phone alternativePhone profileImage"
      );

  const recovered =
    staleCandidates
      .map((ride) => {
        const object =
          typeof ride?.toObject ===
            "function"
            ? ride.toObject()
            : ride;

        const pickupCoordinates =
          getPickupCoordinates(object);
        const recoveredDistanceKm =
          distanceKm(
            driverCoordinates,
            pickupCoordinates
          );

        return {
          ...object,
          recoveredDistanceKm,
          requestRecoveredFromExpiredDispatch:
            true,
          requestPreviewOnly: false,
          actionsLocked: false
        };
      })
      .filter((ride) => {
        if (
          !driverCoordinates ||
          !Number.isFinite(
            Number(
              ride.recoveredDistanceKm
            )
          )
        ) {
          return true;
        }

        return (
          Number(
            ride.recoveredDistanceKm
          ) <=
          MAX_RECOVERY_DISTANCE_KM
        );
      })
      .sort((firstRide, secondRide) => {
        const firstDistance =
          Number.isFinite(
            Number(
              firstRide.recoveredDistanceKm
            )
          )
            ? Number(
                firstRide.recoveredDistanceKm
              )
            : Number.POSITIVE_INFINITY;

        const secondDistance =
          Number.isFinite(
            Number(
              secondRide.recoveredDistanceKm
            )
          )
            ? Number(
                secondRide.recoveredDistanceKm
              )
            : Number.POSITIVE_INFINITY;

        if (
          firstDistance !==
          secondDistance
        ) {
          return (
            firstDistance -
            secondDistance
          );
        }

        return (
          new Date(
            secondRide?.updatedAt ||
              0
          ).getTime() -
          new Date(
            firstRide?.updatedAt ||
              0
          ).getTime()
        );
      })
      .slice(
        0,
        MAX_RECOVERED_RIDES
      );

  if (!recovered.length) {
    return payload;
  }

  const existingBookings =
    normalizeBookings(payload);
  const mergedBookings =
    mergeBookings(
      existingBookings,
      recovered
    );

  payload.bookings = mergedBookings;

  if (
    payload.data &&
    typeof payload.data === "object"
  ) {
    payload.data.bookings =
      mergedBookings;
    payload.data.recoveredRideCount =
      recovered.length;
  }

  payload.count =
    mergedBookings.length;
  payload.recoveredRideCount =
    recovered.length;

  return payload;
}

function recoverExpiredRideFeed(
  req,
  res,
  next
) {
  if (req.user?.role !== "driver") {
    return next();
  }

  const originalJson =
    res.json.bind(res);

  let sent = false;

  res.json = (payload) => {
    if (sent) {
      return originalJson(payload);
    }

    sent = true;

    Promise.resolve(
      enhanceDriverFeed(
        req,
        payload
      )
    )
      .then((enhancedPayload) =>
        originalJson(enhancedPayload)
      )
      .catch((error) => {
        console.error(
          "[DriverRideFeed recovery error]",
          error?.message || error
        );

        originalJson(payload);
      });

    return res;
  };

  return next();
}

module.exports = {
  recoverExpiredRideFeed
};
