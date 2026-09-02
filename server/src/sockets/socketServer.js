const { Server } = require("socket.io");

const {
  initializeRideSocket
} = require("./rideSocket");

let io = null;

function getConfiguredOrigins() {
  return String(
    process.env.CLIENT_URL || ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isLocalNetworkOrigin(origin) {
  if (!origin) {
    return true;
  }

  const pattern =
    /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  return pattern.test(origin);
}

function createCorsOptions() {
  const configuredOrigins =
    getConfiguredOrigins();

  return {
    origin(origin, callback) {
      if (
        configuredOrigins.includes(
          origin
        ) ||
        isLocalNetworkOrigin(origin)
      ) {
        return callback(null, true);
      }

      const error = new Error(
        `Socket connection blocked by CORS: ${origin}`
      );

      error.code =
        "SOCKET_CORS_NOT_ALLOWED";

      return callback(error);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-HimRideG-Client",
      "X-HimRideG-Role",
      "Idempotency-Key"
    ]
  };
}

function createSocketServer(
  httpServer
) {
  if (!httpServer) {
    throw new Error(
      "HTTP server is required to initialize Socket.IO"
    );
  }

  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: createCorsOptions(),

    transports: [
      "websocket",
      "polling"
    ],

    allowUpgrades: true,
    serveClient: false,

    pingInterval:
      Number(
        process.env
          .SOCKET_PING_INTERVAL
      ) || 25000,

    pingTimeout:
      Number(
        process.env
          .SOCKET_PING_TIMEOUT
      ) || 20000,

    connectTimeout:
      Number(
        process.env
          .SOCKET_CONNECT_TIMEOUT
      ) || 45000,

    maxHttpBufferSize:
      Number(
        process.env
          .SOCKET_MAX_HTTP_BUFFER_SIZE
      ) || 1000000,

    cookie: {
      name: "himrideg_socket",
      httpOnly: true,

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      secure:
        process.env.NODE_ENV ===
        "production"
    }
  });

  io.engine.on(
    "connection_error",
    (error) => {
      console.error(
        "Socket.IO connection error:",
        {
          code: error.code,
          message: error.message,
          context: error.context
        }
      );
    }
  );

  initializeRideSocket(io);

  console.log(
    "✅ Socket.IO server initialized"
  );

  return io;
}

function getSocketServer() {
  if (!io) {
    throw new Error(
      "Socket.IO server has not been initialized"
    );
  }

  return io;
}

function hasSocketServer() {
  return Boolean(io);
}

async function closeSocketServer() {
  if (!io) {
    return;
  }

  const socketServer = io;
  io = null;

  await new Promise((resolve) => {
    socketServer.close(() => {
      console.log(
        "✅ Socket.IO server closed"
      );

      resolve();
    });
  });
}

module.exports = {
  createSocketServer,
  getSocketServer,
  hasSocketServer,
  closeSocketServer
};