const {
  getSocketServer,
  hasSocketServer
} = require("../sockets/socketServer");

const {
  SOCKET_EVENTS,
  emitToRide,
  emitToUser,
  emitToDriver,
  emitToCustomer,
  emitToAdmins,
  isUserConnected,
  isDriverConnected,
  isCustomerConnected,
  getConnectedCounts
} = require("../sockets/rideSocket");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getString = (value) => {
  return String(value ?? "").trim();
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return getString(
      value._id ||
        value.id ||
        value.userId ||
        value.bookingId
    );
  }

  return getString(value);
};

const getBookingId = (booking) => {
  return getId(
    booking?._id ||
      booking?.id ||
      booking?.bookingId
  );
};

const getCustomerId = (booking) => {
  return getId(
    booking?.customer?._id ||
      booking?.customer ||
      booking?.customerId?._id ||
      booking?.customerId
  );
};

const getDriverId = (booking) => {
  return getId(
    booking?.driver?._id ||
      booking?.driver ||
      booking?.driverId?._id ||
      booking?.driverId ||
      booking?.assignedDriver?._id ||
      booking?.assignedDriver
  );
};

const getSocketInstance = () => {
  if (!hasSocketServer()) {
    return null;
  }

  try {
    return getSocketServer();
  } catch (error) {
    return null;
  }
};

const createEventPayload = ({
  booking = null,
  bookingId = "",
  customerId = "",
  driverId = "",
  message = "",
  status = "",
  data = null,
  metadata = null
} = {}) => {
  const resolvedBookingId =
    getId(bookingId) ||
    getBookingId(booking);

  const resolvedCustomerId =
    getId(customerId) ||
    getCustomerId(booking);

  const resolvedDriverId =
    getId(driverId) ||
    getDriverId(booking);

  const resolvedStatus =
    getString(status) ||
    getString(booking?.status);

  return {
    bookingId:
      resolvedBookingId || null,

    customerId:
      resolvedCustomerId || null,

    driverId:
      resolvedDriverId || null,

    status:
      resolvedStatus || null,

    message:
      getString(message) || null,

    data,

    metadata,

    timestamp: new Date()
  };
};

const safelyEmit = (emitter) => {
  try {
    const io = getSocketInstance();

    if (!io) {
      return false;
    }

    return Boolean(emitter(io));
  } catch (error) {
    console.error(
      `Socket event emit error: ${error.message}`
    );

    return false;
  }
};

/*
|--------------------------------------------------------------------------
| Generic Emitters
|--------------------------------------------------------------------------
*/

const emitRideEvent = (
  bookingId,
  eventName,
  payload
) => {
  const resolvedBookingId =
    getId(bookingId);

  if (
    !resolvedBookingId ||
    !getString(eventName)
  ) {
    return false;
  }

  return safelyEmit((io) =>
    emitToRide(
      io,
      resolvedBookingId,
      eventName,
      payload
    )
  );
};

const emitUserEvent = (
  userId,
  eventName,
  payload
) => {
  const resolvedUserId =
    getId(userId);

  if (
    !resolvedUserId ||
    !getString(eventName)
  ) {
    return false;
  }

  return safelyEmit((io) =>
    emitToUser(
      io,
      resolvedUserId,
      eventName,
      payload
    )
  );
};

const emitDriverEvent = (
  driverId,
  eventName,
  payload
) => {
  const resolvedDriverId =
    getId(driverId);

  if (
    !resolvedDriverId ||
    !getString(eventName)
  ) {
    return false;
  }

  return safelyEmit((io) =>
    emitToDriver(
      io,
      resolvedDriverId,
      eventName,
      payload
    )
  );
};

const emitCustomerEvent = (
  customerId,
  eventName,
  payload
) => {
  const resolvedCustomerId =
    getId(customerId);

  if (
    !resolvedCustomerId ||
    !getString(eventName)
  ) {
    return false;
  }

  return safelyEmit((io) =>
    emitToCustomer(
      io,
      resolvedCustomerId,
      eventName,
      payload
    )
  );
};

const emitAdminEvent = (
  eventName,
  payload
) => {
  if (!getString(eventName)) {
    return false;
  }

  return safelyEmit((io) =>
    emitToAdmins(
      io,
      eventName,
      payload
    )
  );
};

/*
|--------------------------------------------------------------------------
| Multi-Room Ride Event
|--------------------------------------------------------------------------
*/

const emitBookingEvent = ({
  booking,
  bookingId,
  customerId,
  driverId,
  eventName,
  message,
  status,
  data = null,
  metadata = null,
  sendToRide = true,
  sendToCustomer = true,
  sendToDriver = true,
  sendToAdmins = true
} = {}) => {
  if (!getString(eventName)) {
    return false;
  }

  const payload = createEventPayload({
    booking,
    bookingId,
    customerId,
    driverId,
    message,
    status,
    data,
    metadata
  });

  const results = [];

  if (
    sendToRide &&
    payload.bookingId
  ) {
    results.push(
      emitRideEvent(
        payload.bookingId,
        eventName,
        payload
      )
    );
  }

  if (
    sendToCustomer &&
    payload.customerId
  ) {
    results.push(
      emitCustomerEvent(
        payload.customerId,
        eventName,
        payload
      )
    );
  }

  if (
    sendToDriver &&
    payload.driverId
  ) {
    results.push(
      emitDriverEvent(
        payload.driverId,
        eventName,
        payload
      )
    );
  }

  if (sendToAdmins) {
    results.push(
      emitAdminEvent(
        eventName,
        payload
      )
    );
  }

  return results.some(Boolean);
};

/*
|--------------------------------------------------------------------------
| Ride Request Events
|--------------------------------------------------------------------------
*/

const emitRideRequest = ({
  booking,
  driverId,
  expiresAt = null,
  requestNumber = null,
  data = null
} = {}) => {
  const payload = createEventPayload({
    booking,
    driverId,
    message:
      "New ride request received",
    status:
      booking?.status,
    data: {
      booking,
      expiresAt,
      requestNumber,
      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });

  const driverSent =
    payload.driverId
      ? emitDriverEvent(
          payload.driverId,
          SOCKET_EVENTS.RIDE_REQUEST,
          payload
        )
      : false;

  const adminSent =
    emitAdminEvent(
      SOCKET_EVENTS.RIDE_REQUEST,
      payload
    );

  return driverSent || adminSent;
};

const emitRideRequestCancelled = ({
  booking,
  driverId,
  reason = "",
  data = null
} = {}) => {
  const payload = createEventPayload({
    booking,
    driverId,
    message:
      reason ||
      "Ride request cancelled",
    data: {
      reason:
        getString(reason) || null,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });

  const driverSent =
    payload.driverId
      ? emitDriverEvent(
          payload.driverId,
          SOCKET_EVENTS
            .RIDE_REQUEST_CANCELLED,
          payload
        )
      : false;

  const adminSent =
    emitAdminEvent(
      SOCKET_EVENTS
        .RIDE_REQUEST_CANCELLED,
      payload
    );

  return driverSent || adminSent;
};

/*
|--------------------------------------------------------------------------
| Ride Accepted And Rejected
|--------------------------------------------------------------------------
*/

const emitRideAccepted = ({
  booking,
  driverId,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    driverId,
    eventName:
      SOCKET_EVENTS.RIDE_ACCEPTED,

    message:
      "Driver accepted the ride",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

const emitRideRejected = ({
  booking,
  driverId,
  reason = "",
  data = null
} = {}) => {
  const payload = createEventPayload({
    booking,
    driverId,
    message:
      reason ||
      "Driver rejected the ride",
    data: {
      reason:
        getString(reason) || null,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });

  const customerSent =
    payload.customerId
      ? emitCustomerEvent(
          payload.customerId,
          SOCKET_EVENTS.RIDE_REJECTED,
          payload
        )
      : false;

  const adminSent =
    emitAdminEvent(
      SOCKET_EVENTS.RIDE_REJECTED,
      payload
    );

  return customerSent || adminSent;
};

/*
|--------------------------------------------------------------------------
| Driver Arrival Events
|--------------------------------------------------------------------------
*/

const emitDriverArriving = ({
  booking,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.DRIVER_ARRIVING,

    message:
      "Driver is arriving at pickup location",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

const emitDriverArrived = ({
  booking,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.DRIVER_ARRIVED,

    message:
      "Driver has arrived at pickup location",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

/*
|--------------------------------------------------------------------------
| Ride Start OTP Events
|--------------------------------------------------------------------------
*/

const emitRideOtpGenerated = ({
  booking,
  otp = null,
  expiresAt = null,
  data = null
} = {}) => {
  const payload = createEventPayload({
    booking,
    message:
      "Ride start OTP generated",

    data: {
      otp,
      expiresAt,
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });

  const customerSent =
    payload.customerId
      ? emitCustomerEvent(
          payload.customerId,
          SOCKET_EVENTS.OTP_GENERATED,
          payload
        )
      : false;

  const rideSent =
    payload.bookingId
      ? emitRideEvent(
          payload.bookingId,
          SOCKET_EVENTS.OTP_GENERATED,
          payload
        )
      : false;

  const adminSent =
    emitAdminEvent(
      SOCKET_EVENTS.OTP_GENERATED,
      {
        ...payload,

        data: {
          booking,
          expiresAt,
          otpGenerated: Boolean(otp)
        }
      }
    );

  return (
    customerSent ||
    rideSent ||
    adminSent
  );
};

const emitRideOtpVerified = ({
  booking,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.OTP_VERIFIED,

    message:
      "Ride start OTP verified",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

/*
|--------------------------------------------------------------------------
| Ride Lifecycle Events
|--------------------------------------------------------------------------
*/

const emitRideStarted = ({
  booking,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.RIDE_STARTED,

    message:
      "Ride started successfully",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

const emitRideCompleted = ({
  booking,
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.RIDE_COMPLETED,

    message:
      "Ride completed successfully",

    data: {
      booking,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

const emitRideCancelled = ({
  booking,
  cancelledBy = "",
  reason = "",
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    eventName:
      SOCKET_EVENTS.RIDE_CANCELLED,

    message:
      reason ||
      "Ride cancelled",

    data: {
      booking,

      cancelledBy:
        getString(cancelledBy) ||
        null,

      reason:
        getString(reason) ||
        null,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

const emitRideStatusUpdated = ({
  booking,
  previousStatus = "",
  status = "",
  data = null
} = {}) => {
  return emitBookingEvent({
    booking,
    status:
      status ||
      booking?.status,

    eventName:
      SOCKET_EVENTS
        .RIDE_STATUS_UPDATED,

    message:
      "Ride status updated",

    data: {
      booking,

      previousStatus:
        getString(previousStatus) ||
        null,

      currentStatus:
        getString(
          status ||
            booking?.status
        ) || null,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });
};

/*
|--------------------------------------------------------------------------
| Driver Location Events
|--------------------------------------------------------------------------
*/

const emitDriverLocationUpdated = ({
  booking,
  bookingId,
  customerId,
  driverId,
  location,
  status = "",
  data = null
} = {}) => {
  const payload = createEventPayload({
    booking,
    bookingId,
    customerId,
    driverId,
    status,
    message:
      "Driver location updated",

    data: {
      location,

      ...(
        data &&
        typeof data === "object"
          ? data
          : {}
      )
    }
  });

  const results = [];

  if (payload.bookingId) {
    results.push(
      emitRideEvent(
        payload.bookingId,
        SOCKET_EVENTS
          .DRIVER_LOCATION_UPDATED,
        payload
      )
    );
  }

  if (payload.customerId) {
    results.push(
      emitCustomerEvent(
        payload.customerId,
        SOCKET_EVENTS
          .DRIVER_LOCATION_UPDATED,
        payload
      )
    );
  }

  results.push(
    emitAdminEvent(
      SOCKET_EVENTS
        .DRIVER_LOCATION_UPDATED,
      payload
    )
  );

  return results.some(Boolean);
};

/*
|--------------------------------------------------------------------------
| Driver Presence Events
|--------------------------------------------------------------------------
*/

const emitDriverOnline = ({
  driverId,
  location = null,
  data = null
} = {}) => {
  const payload = {
    driverId:
      getId(driverId) || null,

    isOnline: true,

    location,

    data,

    timestamp: new Date()
  };

  return emitAdminEvent(
    SOCKET_EVENTS.DRIVER_ONLINE,
    payload
  );
};

const emitDriverOffline = ({
  driverId,
  reason = "",
  data = null
} = {}) => {
  const payload = {
    driverId:
      getId(driverId) || null,

    isOnline: false,

    reason:
      getString(reason) ||
      "Driver went offline",

    data,

    timestamp: new Date()
  };

  return emitAdminEvent(
    SOCKET_EVENTS.DRIVER_OFFLINE,
    payload
  );
};

/*
|--------------------------------------------------------------------------
| Connection Information
|--------------------------------------------------------------------------
*/

const getSocketConnectionStatus = ({
  userId = "",
  driverId = "",
  customerId = ""
} = {}) => {
  const resolvedUserId =
    getId(userId);

  const resolvedDriverId =
    getId(driverId);

  const resolvedCustomerId =
    getId(customerId);

  return {
    socketServerReady:
      hasSocketServer(),

    userConnected:
      resolvedUserId
        ? isUserConnected(
            resolvedUserId
          )
        : null,

    driverConnected:
      resolvedDriverId
        ? isDriverConnected(
            resolvedDriverId
          )
        : null,

    customerConnected:
      resolvedCustomerId
        ? isCustomerConnected(
            resolvedCustomerId
          )
        : null,

    connectedCounts:
      getConnectedCounts()
  };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  SOCKET_EVENTS,

  createEventPayload,

  emitRideEvent,
  emitUserEvent,
  emitDriverEvent,
  emitCustomerEvent,
  emitAdminEvent,
  emitBookingEvent,

  emitRideRequest,
  emitRideRequestCancelled,

  emitRideAccepted,
  emitRideRejected,

  emitDriverArriving,
  emitDriverArrived,

  emitRideOtpGenerated,
  emitRideOtpVerified,

  emitRideStarted,
  emitRideCompleted,
  emitRideCancelled,
  emitRideStatusUpdated,

  emitDriverLocationUpdated,

  emitDriverOnline,
  emitDriverOffline,

  getSocketConnectionStatus
};