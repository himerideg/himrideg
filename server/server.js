require("dotenv").config();

const dns = require("node:dns");

// Local Windows/ISP DNS environments ke liye Atlas SRV fallback.
// Production hosting par platform DNS ko override nahi karte.
if (process.env.NODE_ENV !== "production") {
  dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
  ]);
}

const http = require("http");

const app = require("./src/app");

const {
  connectDatabase,
  disconnectDatabase
} = require("./src/config/database");

const {
  createSocketServer,
  closeSocketServer
} = require("./src/sockets/socketServer");

const {
  startPayoutScheduler,
  stopPayoutScheduler
} = require("./src/services/payoutScheduler");

const PORT =
  Number(process.env.PORT) || 5001;

// Mobile aur doosre local devices ke liye
const HOST = "0.0.0.0";

const httpServer =
  http.createServer(app);

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io =
  createSocketServer(httpServer);

// Express controllers ko Socket.IO instance dena
app.set("io", io);

/*
|--------------------------------------------------------------------------
| Shutdown State
|--------------------------------------------------------------------------
*/

let isShuttingDown = false;

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    await connectDatabase();
    startPayoutScheduler();

    httpServer.listen(
      PORT,
      HOST,
      () => {
        console.log("");
        console.log(
          "========================================"
        );
        console.log(
          "🚕 HimRideG v2 Backend Started"
        );
        console.log(
          `🌐 Laptop: http://localhost:${PORT}`
        );
        console.log(
          `📱 Mobile: http://LAPTOP_IP:${PORT}`
        );
        console.log(
          `❤️ Health: http://localhost:${PORT}/api/v2/health`
        );
        console.log(
          `⚙️ Environment: ${
            process.env.NODE_ENV ||
            "development"
          }`
        );
        console.log(
          "🗄️ MongoDB: Connected"
        );
        console.log(
          "🔌 Socket.IO: Ready"
        );
        console.log(
          `🌍 Host: ${HOST}`
        );
        console.log(
          "========================================"
        );
        console.log("");
      }
    );
  } catch (error) {
    console.error("");
    console.error(
      "❌ HimRideG v2 server start nahi ho saka."
    );
    console.error(
      `Reason: ${error.message}`
    );
    console.error("");

    stopPayoutScheduler();

    try {
      await closeSocketServer();
    } catch (socketError) {
      console.error(
        "Socket close error:",
        socketError.message
      );
    }

    try {
      await disconnectDatabase();
    } catch (databaseError) {
      console.error(
        "Database disconnect error:",
        databaseError.message
      );
    }

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log("");
  console.log(
    `${signal} received. Server close ho raha hai...`
  );

  const forceShutdownTimer =
    setTimeout(() => {
      console.error(
        "❌ Forced shutdown"
      );

      process.exit(1);
    }, 10000);

  forceShutdownTimer.unref();

  stopPayoutScheduler();

  try {
    await closeSocketServer();
  } catch (error) {
    console.error(
      "Socket shutdown error:",
      error.message
    );
  }

  httpServer.close(
    async (error) => {
      if (error) {
        console.error(
          "HTTP shutdown error:",
          error.message
        );
      }

      try {
        await disconnectDatabase();

        console.log(
          "✅ MongoDB disconnected"
        );
        console.log(
          "✅ HTTP server closed"
        );

        clearTimeout(
          forceShutdownTimer
        );

        process.exit(
          error ? 1 : 0
        );
      } catch (databaseError) {
        console.error(
          "Database shutdown error:",
          databaseError.message
        );

        clearTimeout(
          forceShutdownTimer
        );

        process.exit(1);
      }
    }
  );
};

/*
|--------------------------------------------------------------------------
| Process Events
|--------------------------------------------------------------------------
*/

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "Unhandled rejection:",
      error
    );

    shutdown(
      "UNHANDLED_REJECTION"
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    shutdown(
      "UNCAUGHT_EXCEPTION"
    );
  }
);

/*
|--------------------------------------------------------------------------
| Run
|--------------------------------------------------------------------------
*/

startServer();