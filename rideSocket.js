const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");

/*
|--------------------------------------------------------------------------
| Socket Event Names
|--------------------------------------------------------------------------
*/

const SOCKET_EVENTS = {
  CONNECTION_SUCCESS: "connection:success",
  SOCKET_ERROR: "socket:error",
  JOIN_USER_ROOM: "user:join",
  LEAVE_USER_ROOM: "user:leave",
  JOIN_RIDE_ROOM: "ride:join",
  LEAVE_RIDE_ROOM: "ride:leave",
  DRIVER_ONLINE: "driver:online",
  DRIVER_OFFLINE: "driver:offline",
  DRIVER_LOCATION_UPDATE: "driver:location:update",
  DRIVER_LOCATION_UPDATED: "driver:location:updated",
  DRIVER_LOCATION_ERROR: "driver:location:error",
  RIDE_REQUEST: "ride:request",
  RIDE_REQUEST_CANCELLED: "ride:request:cancelled",
  RIDE_ACCEPTED: "ride:accepted",
  RIDE_REJECTED: "ride:rejected",
  DRIVER_ARRIVING: "ride:driver-arriving",
  DRIVER_ARRIVED: "ride:driver-arrived",
  OTP_GENERATED: "ride:otp-generated",
  OTP_VERIFIED: "ride:otp-verified",
  RIDE_STARTED: "ride:started",
  RIDE_COMPLETED: "ride:completed",
  RIDE_CANCELLED: "ride:cancelled",
  RIDE_STATUS_UPDATED: "ride:status-updated",

  // Fare Negotiation Events
  FARE_OFFERED: "fare:offered",
  FARE_COUNTERED: "fare:countered",
  FARE_ACCEPTED: "fare:accepted",
  FARE_REJECTED: "fare:rejected",
  FARE_STATUS_UPDATED: "fare:status:updated",

  // Payment Events
  PAYMENT_REQUESTED: "payment:requested",
  PAYMENT_CASH_COLLECT: "payment:cash:collect",
  PAYMENT_COMPLETED: "payment:completed",
};

/*
|--------------------------------------------------------------------------
| Active Socket Stores
|--------------------------------------------------------------------------
*/

const connectedUsers = new Map();
const connectedDrivers = new Map();
const connectedCustomers = new Map();
const connectedAdmins = new Map();

/*
|--------------------------------------------------------------------------
| Basic Helpers
|--------------------------------------------------------------------------
*/

const getString = (value) =>
  String(value ?? "").trim();

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

const createSocketError = (
  message,
  code = "SOCKET_ERROR",
  statusCode = 400
) => {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  return error;
};

const getUserId = (user) =>
  String(
    user?._id ||
      user?.id ||
      user?.userId ||
      ""
  );

const getUserRole = (user) =>
  getString(user?.role).toLowerCase();

const getUserRoom = (userId) =>
  `user:${String(userId)}`;

const getDriverRoom = (driverId) =>
  `driver:${String(driverId)}`;

const getCustomerRoom = (customerId) =>
  `customer:${String(customerId)}`;

const getAdminRoom = () =>
  "admins";

const getRideRoom = (bookingId) =>
  `ride:${String(bookingId)}`;

/*
|--------------------------------------------------------------------------
| Token Helpers
|--------------------------------------------------------------------------
*/

const getSocketToken = (socket) => {
  const authToken =
    socket.handshake?.auth?.token;

  if (authToken) {
    return getString(authToken)
      .replace(
        /^Bearer\s+/i,
        ""
      )
      .replace(
        /^['"]|['"]$/g,
        ""
      );
  }

  const authorizationHeader =
    socket.handshake?.headers
      ?.authorization;

  if (authorizationHeader) {
    return getString(
      authorizationHeader
    )
      .replace(
        /^Bearer\s+/i,
        ""
      )
      .replace(
        /^['"]|['"]$/g,
        ""
      );
  }

  const queryToken =
    socket.handshake?.query?.token;

  if (queryToken) {
    return getString(queryToken)
      .replace(
        /^Bearer\s+/i,
        ""
      )
      .replace(
        /^['"]|['"]$/g,
        ""
      );
  }

  return "";
};

const verifySocketToken = (
  token
) => {
  if (!token) {
    throw createSocketError(
      "Authentication token is required",
      "SOCKET_AUTH_TOKEN_REQUIRED",
      401
    );
  }

  const jwtSecrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.JWT_SECRET,
  ].filter(Boolean);

  if (
    jwtSecrets.length === 0
  ) {
    throw createSocketError(
      "JWT secret is not configured",
      "JWT_SECRET_MISSING",
      500
    );
  }

  let lastError = null;

  for (
    const secret of jwtSecrets
  ) {
    try {
      return jwt.verify(
        token,
        secret
      );
    } catch (error) {
      lastError = error;

      if (
        error.name ===
        "TokenExpiredError"
      ) {
        throw createSocketError(
          "Authentication token has expired",
          "SOCKET_TOKEN_EXPIRED",
          401
        );
      }
    }
  }

  console.error(
    "Socket token verify error:",
    lastError?.message ||
      "Unknown token error"
  );

  throw createSocketError(
    "Invalid authentication token",
    "SOCKET_INVALID_TOKEN",
    401
  );
};

/*
|--------------------------------------------------------------------------
| Find Socket User
|--------------------------------------------------------------------------
*/

const findSocketUser =
  async (decodedToken) => {
    const userId =
      decodedToken?._id ||
      decodedToken?.id ||
      decodedToken?.userId ||
      decodedToken?.sub;

    const tokenRole =
      getString(
        decodedToken?.role
      ).toLowerCase();

    if (
      !userId ||
      !isValidObjectId(userId)
    ) {
      throw createSocketError(
        "Invalid user information in token",
        "SOCKET_INVALID_USER_TOKEN",
        401
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    if (
      tokenRole === "admin"
    ) {
      const admin =
        await Admin.findById(
          userId
        ).select(
          "_id name email"
        );

      if (!admin) {
        throw createSocketError(
          "Admin account not found",
          "SOCKET_ADMIN_NOT_FOUND",
          401
        );
      }

      return {
        _id: admin._id,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        isActive: true,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Customer / Driver
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(
        userId
      ).select(
        [
          "_id",
          "name",
          "phone",
          "email",
          "role",
          "isActive",
          "isBlocked",
          "accountStatus",
          "driverProfile",
        ].join(" ")
      );

    if (!user) {
      throw createSocketError(
        "User account not found",
        "SOCKET_USER_NOT_FOUND",
        401
      );
    }

    if (
      user.isActive === false
    ) {
      throw createSocketError(
        "User account is inactive",
        "SOCKET_USER_INACTIVE",
        403
      );
    }

    if (
      user.isBlocked === true ||
      user.accountStatus ===
        "blocked" ||
      user.accountStatus ===
        "deleted"
    ) {
      throw createSocketError(
        "User account is blocked",
        "SOCKET_USER_BLOCKED",
        403
      );
    }

    if (
      user.accountStatus ===
      "suspended"
    ) {
      throw createSocketError(
        "User account is suspended",
        "SOCKET_USER_SUSPENDED",
        403
      );
    }

    return user;
  };

/*
|--------------------------------------------------------------------------
| Socket Authentication Middleware
|--------------------------------------------------------------------------
*/

const socketAuthentication =
  async (socket, next) => {
    try {
      const token =
        getSocketToken(socket);

      const decodedToken =
        verifySocketToken(token);

      const user =
        await findSocketUser(
          decodedToken
        );

      socket.user = user;

      socket.userId =
        getUserId(user);

      socket.userRole =
        getUserRole(user);

      return next();
    } catch (error) {
      const socketError =
        new Error(
          error.message ||
            "Socket authentication failed"
        );

      socketError.data = {
        success: false,

        code:
          error.code ||
          "SOCKET_AUTHENTICATION_FAILED",

        statusCode:
          error.statusCode ||
          401,
      };

      return next(
        socketError
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Connected Socket Store Helpers
|--------------------------------------------------------------------------
*/

const addSocketToStore = (
  store,
  userId,
  socketId
) => {
  const normalizedUserId =
    String(userId);

  if (
    !store.has(
      normalizedUserId
    )
  ) {
    store.set(
      normalizedUserId,
      new Set()
    );
  }

  store
    .get(normalizedUserId)
    .add(socketId);
};

const removeSocketFromStore = (
  store,
  userId,
  socketId
) => {
  const normalizedUserId =
    String(userId);

  const socketIds =
    store.get(
      normalizedUserId
    );

  if (!socketIds) {
    return;
  }

  socketIds.delete(socketId);

  if (
    socketIds.size === 0
  ) {
    store.delete(
      normalizedUserId
    );
  }
};

const hasConnectedSocket = (
  store,
  userId
) => {
  const socketIds =
    store.get(
      String(userId)
    );

  return Boolean(
    socketIds &&
      socketIds.size > 0
  );
};

const registerConnectedSocket =
  (socket) => {
    const {
      userId,
      userRole,
      id: socketId,
    } = socket;

    addSocketToStore(
      connectedUsers,
      userId,
      socketId
    );

    if (
      userRole === "driver"
    ) {
      addSocketToStore(
        connectedDrivers,
        userId,
        socketId
      );
    }

    if (
      userRole === "customer"
    ) {
      addSocketToStore(
        connectedCustomers,
        userId,
        socketId
      );
    }

    if (
      userRole === "admin"
    ) {
      addSocketToStore(
        connectedAdmins,
        userId,
        socketId
      );
    }
  };

const unregisterConnectedSocket =
  (socket) => {
    const {
      userId,
      userRole,
      id: socketId,
    } = socket;

    removeSocketFromStore(
      connectedUsers,
      userId,
      socketId
    );

    if (
      userRole === "driver"
    ) {
      removeSocketFromStore(
        connectedDrivers,
        userId,
        socketId
      );
    }

    if (
      userRole === "customer"
    ) {
      removeSocketFromStore(
        connectedCustomers,
        userId,
        socketId
      );
    }

    if (
      userRole === "admin"
    ) {
      removeSocketFromStore(
        connectedAdmins,
        userId,
        socketId
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Socket Response Helpers
|--------------------------------------------------------------------------
*/

const sendAcknowledgement = (
  callback,
  payload
) => {
  if (
    typeof callback ===
    "function"
  ) {
    callback(payload);
  }
};

const sendSuccess = (
  callback,
  message,
  data = null
) => {
  sendAcknowledgement(
    callback,
    {
      success: true,
      message,
      data,
    }
  );
};

const sendFailure = (
  callback,
  error
) => {
  const payload = {
    success: false,

    message:
      error.message ||
      "Socket request failed",

    code:
      error.code ||
      "SOCKET_REQUEST_FAILED",

    statusCode:
      error.statusCode ||
      400,
  };

  sendAcknowledgement(
    callback,
    payload
  );

  return payload;
};

const emitSocketError = (
  socket,
  error
) => {
  socket.emit(
    SOCKET_EVENTS.SOCKET_ERROR,
    {
      success: false,

      message:
        error.message ||
        "Socket error occurred",

      code:
        error.code ||
        "SOCKET_ERROR",

      statusCode:
        error.statusCode ||
        400,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Authorization Helpers
|--------------------------------------------------------------------------
*/

const requireSocketRole = (
  socket,
  allowedRoles
) => {
  const roles =
    Array.isArray(
      allowedRoles
    )
      ? allowedRoles
      : [allowedRoles];

  if (
    !roles.includes(
      socket.userRole
    )
  ) {
    throw createSocketError(
      "You are not allowed to perform this socket action",
      "SOCKET_ACCESS_DENIED",
      403
    );
  }
};

const getBookingById =
  async (bookingId) => {
    if (
      !bookingId ||
      !isValidObjectId(
        bookingId
      )
    ) {
      throw createSocketError(
        "Invalid booking ID",
        "INVALID_BOOKING_ID",
        400
      );
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      throw createSocketError(
        "Ride not found",
        "RIDE_NOT_FOUND",
        404
      );
    }

    return booking;
  };

const getBookingCustomerId =
  (booking) =>
    String(
      booking.customer?._id ||
        booking.customer ||
        booking.customerId
          ?._id ||
        booking.customerId ||
        ""
    );

const getBookingDriverId =
  (booking) =>
    String(
      booking.driver?._id ||
        booking.driver ||
        booking.driverId
          ?._id ||
        booking.driverId ||
        booking.assignedDriver
          ?._id ||
        booking.assignedDriver ||
        ""
    );

const canAccessRide = (
  socket,
  booking
) => {
  if (
    socket.userRole ===
    "admin"
  ) {
    return true;
  }

  const customerId =
    getBookingCustomerId(
      booking
    );

  const driverId =
    getBookingDriverId(
      booking
    );

  if (
    socket.userRole ===
      "customer" &&
    customerId ===
      socket.userId
  ) {
    return true;
  }

  if (
    socket.userRole ===
      "driver" &&
    driverId ===
      socket.userId
  ) {
    return true;
  }

  return false;
};

/*
|--------------------------------------------------------------------------
| Booking Location Helpers
|--------------------------------------------------------------------------
*/

const normalizeLocationPayload =
  (payload = {}) => {
    const latitude =
      Number(
        payload.latitude
      );

    const longitude =
      Number(
        payload.longitude
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw createSocketError(
        "Latitude must be between -90 and 90",
        "INVALID_LATITUDE",
        400
      );
    }

    if (
      !Number.isFinite(
        longitude
      ) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw createSocketError(
        "Longitude must be between -180 and 180",
        "INVALID_LONGITUDE",
        400
      );
    }

    const heading =
      payload.heading ===
        undefined ||
      payload.heading ===
        null ||
      payload.heading === ""
        ? null
        : Number(
            payload.heading
          );

    const speed =
      payload.speed ===
        undefined ||
      payload.speed ===
        null ||
      payload.speed === ""
        ? null
        : Number(
            payload.speed
          );

    const accuracy =
      payload.accuracy ===
        undefined ||
      payload.accuracy ===
        null ||
      payload.accuracy === ""
        ? null
        : Number(
            payload.accuracy
          );

    if (
      heading !== null &&
      (
        !Number.isFinite(
          heading
        ) ||
        heading < 0 ||
        heading > 360
      )
    ) {
      throw createSocketError(
        "Heading must be between 0 and 360",
        "INVALID_HEADING",
        400
      );
    }

    if (
      speed !== null &&
      (
        !Number.isFinite(
          speed
        ) ||
        speed < 0 ||
        speed > 500
      )
    ) {
      throw createSocketError(
        "Speed must be between 0 and 500",
        "INVALID_SPEED",
        400
      );
    }

    if (
      accuracy !== null &&
      (
        !Number.isFinite(
          accuracy
        ) ||
        accuracy < 0 ||
        accuracy > 10000
      )
    ) {
      throw createSocketError(
        "Accuracy must be between 0 and 10000",
        "INVALID_ACCURACY",
        400
      );
    }

    return {
      type: "Point",

      coordinates: [
        longitude,
        latitude,
      ],

      latitude,
      longitude,
      heading,
      speed,
      accuracy,

      updatedAt:
        new Date(),
    };
  };

const updateBookingDriverLocation =
  async (
    booking,
    location
  ) => {
    const locationData = {
      type: "Point",

      coordinates:
        location.coordinates,

      latitude:
        location.latitude,

      longitude:
        location.longitude,

      heading:
        location.heading,

      speed:
        location.speed,

      accuracy:
        location.accuracy,

      updatedAt:
        location.updatedAt,
    };

    booking.driverLocation =
      locationData;

    await booking.save();

    return locationData;
  };

/*
|--------------------------------------------------------------------------
| User Room Registration
|--------------------------------------------------------------------------
*/

const joinDefaultRooms =
  (socket) => {
    socket.join(
      getUserRoom(
        socket.userId
      )
    );

    if (
      socket.userRole ===
      "driver"
    ) {
      socket.join(
        getDriverRoom(
          socket.userId
        )
      );
    }

    if (
      socket.userRole ===
      "customer"
    ) {
      socket.join(
        getCustomerRoom(
          socket.userId
        )
      );
    }

    if (
      socket.userRole ===
      "admin"
    ) {
      socket.join(
        getAdminRoom()
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Driver Online Status
|--------------------------------------------------------------------------
*/

const setDriverOnlineStatus =
  async (
    socket,
    isOnline
  ) => {
    if (
      socket.userRole !==
      "driver"
    ) {
      return;
    }

    const update = {
      isOnline:
        Boolean(isOnline),
    };

    if (!isOnline) {
      update.lastOnlineAt =
        new Date();
    }

    await User.findByIdAndUpdate(
      socket.userId,
      update,
      {
        runValidators: false,
      }
    ).catch(() => null);
  };

const isEmptyLocationPayload =
  (payload) =>
    payload.latitude ===
      undefined &&
    payload.longitude ===
      undefined;

/*
|--------------------------------------------------------------------------
| Ride Room Handlers
|--------------------------------------------------------------------------
*/

const handleJoinRide =
  (socket) => {
    socket.on(
      SOCKET_EVENTS.JOIN_RIDE_ROOM,

      async (
        payload = {},
        callback
      ) => {
        try {
          const bookingId =
            getString(
              payload.bookingId
            );

          const booking =
            await getBookingById(
              bookingId
            );

          if (
            !canAccessRide(
              socket,
              booking
            )
          ) {
            throw createSocketError(
              "You are not allowed to join this ride room",
              "RIDE_ROOM_ACCESS_DENIED",
              403
            );
          }

          const roomName =
            getRideRoom(
              bookingId
            );

          await socket.join(
            roomName
          );

          sendSuccess(
            callback,
            "Ride room joined successfully",
            {
              bookingId,
              room: roomName,
              status:
                booking.status,
            }
          );
        } catch (error) {
          sendFailure(
            callback,
            error
          );

          emitSocketError(
            socket,
            error
          );
        }
      }
    );
  };

const handleLeaveRide =
  (socket) => {
    socket.on(
      SOCKET_EVENTS.LEAVE_RIDE_ROOM,

      async (
        payload = {},
        callback
      ) => {
        try {
          const bookingId =
            getString(
              payload.bookingId
            );

          if (
            !bookingId ||
            !isValidObjectId(
              bookingId
            )
          ) {
            throw createSocketError(
              "Invalid booking ID",
              "INVALID_BOOKING_ID",
              400
            );
          }

          const roomName =
            getRideRoom(
              bookingId
            );

          await socket.leave(
            roomName
          );

          sendSuccess(
            callback,
            "Ride room left successfully",
            {
              bookingId,
              room: roomName,
            }
          );
        } catch (error) {
          sendFailure(
            callback,
            error
          );
        }
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Driver Location Handler
|--------------------------------------------------------------------------
*/

const handleDriverLocationUpdate =
  (io, socket) => {
    socket.on(
      SOCKET_EVENTS
        .DRIVER_LOCATION_UPDATE,

      async (
        payload = {},
        callback
      ) => {
        try {
          requireSocketRole(
            socket,
            "driver"
          );

          const bookingId =
            getString(
              payload.bookingId
            );

          const booking =
            await getBookingById(
              bookingId
            );

          const assignedDriverId =
            getBookingDriverId(
              booking
            );

          if (
            !assignedDriverId ||
            assignedDriverId !==
              socket.userId
          ) {
            throw createSocketError(
              "Only the assigned driver can update ride location",
              "DRIVER_NOT_ASSIGNED",
              403
            );
          }

          const blockedStatuses =
            [
              "completed",
              "cancelled",
              "expired",
            ];

          if (
            blockedStatuses.includes(
              booking.status
            )
          ) {
            throw createSocketError(
              "Location cannot be updated for this ride",
              "RIDE_LOCATION_UPDATE_NOT_ALLOWED",
              400
            );
          }

          const location =
            normalizeLocationPayload(
              payload
            );

          const savedLocation =
            await updateBookingDriverLocation(
              booking,
              location
            );

          const eventPayload =
            {
              bookingId,

              driverId:
                socket.userId,

              location:
                savedLocation,

              rideStatus:
                booking.status,

              timestamp:
                new Date(),
            };

          io.to(
            getRideRoom(
              bookingId
            )
          ).emit(
            SOCKET_EVENTS
              .DRIVER_LOCATION_UPDATED,
            eventPayload
          );

          const customerId =
            getBookingCustomerId(
              booking
            );

          if (customerId) {
            io.to(
              getCustomerRoom(
                customerId
              )
            ).emit(
              SOCKET_EVENTS
                .DRIVER_LOCATION_UPDATED,
              eventPayload
            );
          }

          io.to(
            getAdminRoom()
          ).emit(
            SOCKET_EVENTS
              .DRIVER_LOCATION_UPDATED,
            eventPayload
          );

          sendSuccess(
            callback,
            "Driver location updated successfully",
            eventPayload
          );
        } catch (error) {
          const errorPayload =
            sendFailure(
              callback,
              error
            );

          socket.emit(
            SOCKET_EVENTS
              .DRIVER_LOCATION_ERROR,
            errorPayload
          );
        }
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Driver Online And Offline Handlers
|--------------------------------------------------------------------------
*/

const handleDriverOnline =
  (io, socket) => {
    socket.on(
      SOCKET_EVENTS
        .DRIVER_ONLINE,

      async (
        payload = {},
        callback
      ) => {
        try {
          requireSocketRole(
            socket,
            "driver"
          );

          await setDriverOnlineStatus(
            socket,
            true
          );

          if (
            !isEmptyLocationPayload(
              payload
            )
          ) {
            const location =
              normalizeLocationPayload(
                payload
              );

            await User.findByIdAndUpdate(
              socket.userId,

              {
                currentLocation: {
                  type: "Point",

                  coordinates:
                    location.coordinates,
                },

                lastLocationUpdateAt:
                  location.updatedAt,

                isOnline: true,
              },

              {
                runValidators:
                  false,
              }
            ).catch(
              () => null
            );
          }

          const eventPayload =
            {
              driverId:
                socket.userId,

              isOnline: true,

              connectedAt:
                new Date(),
            };

          io.to(
            getAdminRoom()
          ).emit(
            SOCKET_EVENTS
              .DRIVER_ONLINE,
            eventPayload
          );

          sendSuccess(
            callback,
            "Driver is online",
            eventPayload
          );
        } catch (error) {
          sendFailure(
            callback,
            error
          );
        }
      }
    );
  };

const handleDriverOffline =
  (io, socket) => {
    socket.on(
      SOCKET_EVENTS
        .DRIVER_OFFLINE,

      async (
        payload = {},
        callback
      ) => {
        try {
          requireSocketRole(
            socket,
            "driver"
          );

          await setDriverOnlineStatus(
            socket,
            false
          );

          const eventPayload =
            {
              driverId:
                socket.userId,

              isOnline: false,

              disconnectedAt:
                new Date(),

              reason:
                getString(
                  payload.reason
                ) ||
                "Driver went offline",
            };

          io.to(
            getAdminRoom()
          ).emit(
            SOCKET_EVENTS
              .DRIVER_OFFLINE,
            eventPayload
          );

          sendSuccess(
            callback,
            "Driver is offline",
            eventPayload
          );
        } catch (error) {
          sendFailure(
            callback,
            error
          );
        }
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Fare Negotiation Handlers
|--------------------------------------------------------------------------
*/

const handleFareNegotiation =
  (io, socket) => {
    /*
    |--------------------------------------------------------------------------
    | Driver Fare Offer
    |--------------------------------------------------------------------------
    */

    socket.on(
      "fare:offer",

      async (
        payload,
        callback
      ) => {
        try {
          if (
            socket.userRole !==
            "driver"
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Sirf driver fare offer kar sakta hai",

                code:
                  "ACCESS_DENIED",
              }
            );
          }

          const {
            bookingId,
            amount,
          } =
            payload || {};

          if (
            !bookingId ||
            !amount ||
            Number(amount) <= 0
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Booking ID aur valid amount required hai",
              }
            );
          }

          const fare =
            Number(amount);

          if (
            fare < 50 ||
            fare > 10000
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Fare ₹50 se ₹10,000 ke beech hona chahiye",
              }
            );
          }

          const booking =
            await getBookingById(
              bookingId
            );

          const bookingDriverId =
            getBookingDriverId(
              booking
            );

          if (
            bookingDriverId !==
            socket.userId
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Ye aapki ride nahi hai",
              }
            );
          }

          if (
            (
              booking.fareOfferCount ||
              0
            ) >= 6
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Zyada baar offer nahi kar sakte. Final decision karo.",
              }
            );
          }

          booking.driverOfferedFare =
            fare;

          booking.fareStatus =
            "driver_offered";

          booking.fareOfferedBy =
            "driver";

          booking.fareOfferCount =
            (
              booking.fareOfferCount ||
              0
            ) + 1;

          booking.fareOfferedAt =
            new Date();

          if (
            [
              "accepted",
              "driver_arriving",
              "driver_arrived",
              "fare_accepted",
            ].includes(
              booking.status
            )
          ) {
            booking.status =
              "negotiating";
          }

          await booking.save();

          const customerId =
            getBookingCustomerId(
              booking
            );

          const fareData = {
            bookingId,

            driverOfferedFare:
              fare,

            fareOfferCount:
              booking.fareOfferCount,

            message:
              `Driver ne ₹${fare} ka offer diya hai`,

            timestamp:
              new Date(),
          };

          io.to(
            getUserRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_OFFERED,
            fareData
          );

          io.to(
            getCustomerRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_OFFERED,
            fareData
          );

          io.to(
            getRideRoom(
              bookingId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_STATUS_UPDATED,

            {
              bookingId,

              fareStatus:
                "driver_offered",

              driverOfferedFare:
                fare,

              fareOfferCount:
                booking
                  .fareOfferCount,
            }
          );

          sendSuccess(
            callback,
            `Fare ₹${fare} offer bhej diya`,

            {
              driverOfferedFare:
                fare,

              fareOfferCount:
                booking
                  .fareOfferCount,
            }
          );
        } catch (error) {
          console.error(
            "fare:offer error:",
            error
          );

          sendFailure(
            callback,
            {
              message:
                error.message ||
                "Fare offer nahi ho saka",
            }
          );
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Customer Counter Offer
    |--------------------------------------------------------------------------
    */

    socket.on(
      "fare:counter",

      async (
        payload,
        callback
      ) => {
        try {
          if (
            socket.userRole !==
            "customer"
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Sirf customer counter offer kar sakta hai",
              }
            );
          }

          const {
            bookingId,
            amount,
          } =
            payload || {};

          if (
            !bookingId ||
            !amount ||
            Number(amount) <= 0
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Booking ID aur valid amount required hai",
              }
            );
          }

          const fare =
            Number(amount);

          if (
            fare < 50 ||
            fare > 10000
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Counter fare ₹50 se ₹10,000 ke beech hona chahiye",
              }
            );
          }

          const booking =
            await getBookingById(
              bookingId
            );

          const customerId =
            getBookingCustomerId(
              booking
            );

          if (
            customerId !==
            socket.userId
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Ye aapki ride nahi hai",
              }
            );
          }

          if (
            (
              booking.fareOfferCount ||
              0
            ) >= 6
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Negotiation limit khatam. Accept ya reject karo.",
              }
            );
          }

          booking.customerCounterFare =
            fare;

          booking.fareStatus =
            "customer_countered";

          booking.fareOfferedBy =
            "customer";

          booking.fareOfferCount =
            (
              booking.fareOfferCount ||
              0
            ) + 1;

          booking.fareOfferedAt =
            new Date();

          await booking.save();

          const driverId =
            getBookingDriverId(
              booking
            );

          const counterData =
            {
              bookingId,

              customerCounterFare:
                fare,

              fareOfferCount:
                booking
                  .fareOfferCount,

              message:
                `Customer ne ₹${fare} ka counter offer diya`,

              timestamp:
                new Date(),
            };

          io.to(
            getUserRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_COUNTERED,
            counterData
          );

          io.to(
            getDriverRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_COUNTERED,
            counterData
          );

          io.to(
            getRideRoom(
              bookingId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_STATUS_UPDATED,

            {
              bookingId,

              fareStatus:
                "customer_countered",

              customerCounterFare:
                fare,
            }
          );

          sendSuccess(
            callback,
            "Counter offer bhej diya gaya",

            {
              customerCounterFare:
                fare,

              fareOfferCount:
                booking
                  .fareOfferCount,
            }
          );
        } catch (error) {
          console.error(
            "fare:counter error:",
            error
          );

          sendFailure(
            callback,
            {
              message:
                error.message ||
                "Counter offer nahi ho saka",
            }
          );
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Fare Accept
    |--------------------------------------------------------------------------
    */

    socket.on(
      "fare:accept",

      async (
        payload,
        callback
      ) => {
        try {
          const {
            bookingId,
          } =
            payload || {};

          if (!bookingId) {
            return sendFailure(
              callback,
              {
                message:
                  "Booking ID required hai",
              }
            );
          }

          const booking =
            await getBookingById(
              bookingId
            );

          const customerId =
            getBookingCustomerId(
              booking
            );

          const driverId =
            getBookingDriverId(
              booking
            );

          if (
            socket.userRole ===
              "customer" &&
            customerId !==
              socket.userId
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Ye aapki ride nahi hai",
              }
            );
          }

          if (
            socket.userRole ===
              "driver" &&
            driverId !==
              socket.userId
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Ye aapki ride nahi hai",
              }
            );
          }

          if (
            ![
              "customer",
              "driver",
            ].includes(
              socket.userRole
            )
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Access denied",
              }
            );
          }

          let finalFare;

          if (
            socket.userRole ===
            "customer"
          ) {
            finalFare =
              booking.driverOfferedFare ||
              booking.customerCounterFare ||
              booking.estimatedFare;
          } else {
            finalFare =
              booking.customerCounterFare ||
              booking.driverOfferedFare ||
              booking.estimatedFare;
          }

          if (
            !finalFare ||
            finalFare <= 0
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Final fare valid nahi hai",
              }
            );
          }

          booking.finalFare =
            Number(
              finalFare
            );

          booking.fareStatus =
            "fare_accepted";

          booking.fareAcceptedAt =
            new Date();

          booking.status =
            "fare_accepted";

          const commissionPercent =
            booking
              .platformCommissionPercent ||
            10;

          booking.platformCommissionAmount =
            Math.round(
              (
                finalFare *
                commissionPercent
              ) / 100
            );

          booking.driverPayableAmount =
            finalFare -
            booking
              .platformCommissionAmount;

          await booking.save();

          const fareAcceptedData =
            {
              bookingId,

              finalFare,

              fareStatus:
                "fare_accepted",

              message:
                `Fare ₹${finalFare} pe lock ho gaya! 🎉`,

              driverPayable:
                booking
                  .driverPayableAmount,

              timestamp:
                new Date(),
            };

          io.to(
            getUserRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_ACCEPTED,
            fareAcceptedData
          );

          io.to(
            getCustomerRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_ACCEPTED,
            fareAcceptedData
          );

          io.to(
            getUserRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_ACCEPTED,
            fareAcceptedData
          );

          io.to(
            getDriverRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_ACCEPTED,
            fareAcceptedData
          );

          io.to(
            getRideRoom(
              bookingId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_STATUS_UPDATED,
            fareAcceptedData
          );

          io.to(
            getUserRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .PAYMENT_REQUESTED,

            {
              bookingId,

              finalFare,

              message:
                "Ride complete hone par payment karna hoga",

              paymentMethods:
                [
                  "online",
                  "cash",
                ],
            }
          );

          sendSuccess(
            callback,
            `Fare ₹${finalFare} accept ho gaya`,

            {
              finalFare,
            }
          );
        } catch (error) {
          console.error(
            "fare:accept error:",
            error
          );

          sendFailure(
            callback,
            {
              message:
                error.message ||
                "Fare accept nahi ho saka",
            }
          );
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Fare Reject
    |--------------------------------------------------------------------------
    */

    socket.on(
      "fare:reject",

      async (
        payload,
        callback
      ) => {
        try {
          const {
            bookingId,
          } =
            payload || {};

          if (!bookingId) {
            return sendFailure(
              callback,
              {
                message:
                  "Booking ID required hai",
              }
            );
          }

          const booking =
            await getBookingById(
              bookingId
            );

          booking.fareStatus =
            "fare_rejected";

          await booking.save();

          const customerId =
            getBookingCustomerId(
              booking
            );

          const driverId =
            getBookingDriverId(
              booking
            );

          const rejectData =
            {
              bookingId,

              fareStatus:
                "fare_rejected",

              message:
                "Fare reject ho gaya. Phir se negotiate karo ya ride cancel karo.",

              timestamp:
                new Date(),
            };

          io.to(
            getUserRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_REJECTED,
            rejectData
          );

          io.to(
            getCustomerRoom(
              customerId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_REJECTED,
            rejectData
          );

          io.to(
            getUserRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_REJECTED,
            rejectData
          );

          io.to(
            getDriverRoom(
              driverId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_REJECTED,
            rejectData
          );

          io.to(
            getRideRoom(
              bookingId
            )
          ).emit(
            SOCKET_EVENTS
              .FARE_STATUS_UPDATED,
            rejectData
          );

          sendSuccess(
            callback,
            "Fare reject ho gaya",
            {}
          );
        } catch (error) {
          console.error(
            "fare:reject error:",
            error
          );

          sendFailure(
            callback,
            {
              message:
                error.message ||
                "Fare reject nahi ho saka",
            }
          );
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Ride Payment Initiate
    |--------------------------------------------------------------------------
    */

    socket.on(
      "ride:payment:initiate",

      async (
        payload,
        callback
      ) => {
        try {
          const {
            bookingId,
            paymentMethod,
          } =
            payload || {};

          if (
            !bookingId ||
            !paymentMethod
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Booking ID aur payment method required hai",
              }
            );
          }

          if (
            ![
              "online",
              "cash",
            ].includes(
              paymentMethod
            )
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Payment method online ya cash hona chahiye",
              }
            );
          }

          const booking =
            await getBookingById(
              bookingId
            );

          if (
            booking.status !==
            "completed"
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Payment sirf completed ride ke liye",
              }
            );
          }

          if (
            booking.paymentStatus ===
            "paid"
          ) {
            return sendFailure(
              callback,
              {
                message:
                  "Payment already ho chuki hai",
              }
            );
          }

          const finalFare =
            Number(
              booking.finalFare ||
                booking
                  .driverOfferedFare ||
                booking
                  .estimatedFare ||
                0
            );

          const driverId =
            getBookingDriverId(
              booking
            );

          if (
            paymentMethod ===
            "cash"
          ) {
            const cashPayload =
              {
                bookingId,

                finalFare,

                message:
                  `Customer ₹${finalFare} cash dega`,

                timestamp:
                  new Date(),
              };

            io.to(
              getUserRoom(
                driverId
              )
            ).emit(
              SOCKET_EVENTS
                .PAYMENT_CASH_COLLECT,
              cashPayload
            );

            io.to(
              getDriverRoom(
                driverId
              )
            ).emit(
              SOCKET_EVENTS
                .PAYMENT_CASH_COLLECT,
              cashPayload
            );

            sendSuccess(
              callback,
              "Driver ko cash collection notify kar diya",

              {
                paymentMethod:
                  "cash",

                finalFare,
              }
            );
          } else {
            sendSuccess(
              callback,
              "Online payment ke liye proceed karo",

              {
                paymentMethod:
                  "online",

                finalFare,

                message:
                  "Frontend se /api/v2/payments/create-order call karo",
              }
            );
          }
        } catch (error) {
          console.error(
            "ride:payment:initiate error:",
            error
          );

          sendFailure(
            callback,
            {
              message:
                error.message ||
                "Payment initiate nahi ho saka",
            }
          );
        }
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Disconnect Handler
|--------------------------------------------------------------------------
*/

const handleDisconnect =
  (io, socket) => {
    socket.on(
      "disconnect",

      async (reason) => {
        unregisterConnectedSocket(
          socket
        );

        if (
          socket.userRole ===
            "driver" &&
          !hasConnectedSocket(
            connectedDrivers,
            socket.userId
          )
        ) {
          await setDriverOnlineStatus(
            socket,
            false
          );

          io.to(
            getAdminRoom()
          ).emit(
            SOCKET_EVENTS
              .DRIVER_OFFLINE,

            {
              driverId:
                socket.userId,

              isOnline: false,

              disconnectedAt:
                new Date(),

              reason,
            }
          );
        }

        console.log(
          `🔌 Socket disconnected: ${socket.id} | User: ${socket.userId} | Reason: ${reason}`
        );
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Main Socket Connection Handler
|--------------------------------------------------------------------------
*/

const registerSocketConnection =
  (io) => {
    io.on(
      "connection",

      async (socket) => {
        registerConnectedSocket(
          socket
        );

        joinDefaultRooms(
          socket
        );

        if (
          socket.userRole ===
          "driver"
        ) {
          await setDriverOnlineStatus(
            socket,
            true
          );
        }

        console.log(
          `🔌 Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.userRole}`
        );

        socket.emit(
          SOCKET_EVENTS
            .CONNECTION_SUCCESS,

          {
            success: true,

            message:
              "Socket connected successfully",

            data: {
              socketId:
                socket.id,

              userId:
                socket.userId,

              role:
                socket.userRole,

              connectedAt:
                new Date(),
            },
          }
        );

        handleJoinRide(
          socket
        );

        handleLeaveRide(
          socket
        );

        handleDriverOnline(
          io,
          socket
        );

        handleDriverOffline(
          io,
          socket
        );

        handleDriverLocationUpdate(
          io,
          socket
        );

        handleFareNegotiation(
          io,
          socket
        );

        handleDisconnect(
          io,
          socket
        );
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Main Initializer
|--------------------------------------------------------------------------
*/

const initializeRideSocket =
  (io) => {
    if (!io) {
      throw new Error(
        "Socket.IO server instance is required"
      );
    }

    io.use(
      socketAuthentication
    );

    registerSocketConnection(
      io
    );

    console.log(
      "✅ Ride Socket.IO initialized"
    );

    return io;
  };

/*
|--------------------------------------------------------------------------
| External Emit Helpers
|--------------------------------------------------------------------------
*/

const emitToRide = (
  io,
  bookingId,
  eventName,
  data
) => {
  if (
    !io ||
    !bookingId ||
    !eventName
  ) {
    return false;
  }

  io.to(
    getRideRoom(
      bookingId
    )
  ).emit(
    eventName,
    data
  );

  return true;
};

const emitToUser = (
  io,
  userId,
  eventName,
  data
) => {
  if (
    !io ||
    !userId ||
    !eventName
  ) {
    return false;
  }

  io.to(
    getUserRoom(
      userId
    )
  ).emit(
    eventName,
    data
  );

  return true;
};

const emitToDriver = (
  io,
  driverId,
  eventName,
  data
) => {
  if (
    !io ||
    !driverId ||
    !eventName
  ) {
    return false;
  }

  io.to(
    getDriverRoom(
      driverId
    )
  ).emit(
    eventName,
    data
  );

  return true;
};

const emitToCustomer = (
  io,
  customerId,
  eventName,
  data
) => {
  if (
    !io ||
    !customerId ||
    !eventName
  ) {
    return false;
  }

  io.to(
    getCustomerRoom(
      customerId
    )
  ).emit(
    eventName,
    data
  );

  return true;
};

const emitToAdmins = (
  io,
  eventName,
  data
) => {
  if (
    !io ||
    !eventName
  ) {
    return false;
  }

  io.to(
    getAdminRoom()
  ).emit(
    eventName,
    data
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| Connection Status Helpers
|--------------------------------------------------------------------------
*/

const isUserConnected = (
  userId
) =>
  hasConnectedSocket(
    connectedUsers,
    userId
  );

const isDriverConnected = (
  driverId
) =>
  hasConnectedSocket(
    connectedDrivers,
    driverId
  );

const isCustomerConnected = (
  customerId
) =>
  hasConnectedSocket(
    connectedCustomers,
    customerId
  );

const getConnectedCounts =
  () => ({
    users:
      connectedUsers.size,

    drivers:
      connectedDrivers.size,

    customers:
      connectedCustomers.size,

    admins:
      connectedAdmins.size,
  });

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  initializeRideSocket,

  SOCKET_EVENTS,

  emitToRide,
  emitToUser,
  emitToDriver,
  emitToCustomer,
  emitToAdmins,

  isUserConnected,
  isDriverConnected,
  isCustomerConnected,

  getConnectedCounts,

  getUserRoom,
  getDriverRoom,
  getCustomerRoom,
  getRideRoom,
  getAdminRoom,
};