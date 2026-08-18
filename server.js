/*
|--------------------------------------------------------------------------
| HimRideG Root Server Entry
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Production Render service ka rootDir "server" hai, isliye Render directly
| server/server.js chalata hai.
|
| Ye ROOT server.js local/root se backend start karne ke liye rakha gaya hai.
| Actual backend source:
|
| server/src/
|
| Isliye is file ke imports "./server/src/..." use karte hain.
|
*/

const path =
  require("node:path");

const fs =
  require("node:fs");

const dotenv =
  require("dotenv");

/*
|--------------------------------------------------------------------------
| Environment Loading
|--------------------------------------------------------------------------
|
| Root se `node server.js` chalane par pehle server/.env load karte hain,
| kyunki actual backend wahi hai.
|
| Agar server/.env nahi hai to root .env fallback rahega.
|
*/

const serverEnvPath =
  path.join(
    __dirname,
    "server",
    ".env"
  );

const rootEnvPath =
  path.join(
    __dirname,
    ".env"
  );

if (
  fs.existsSync(
    serverEnvPath
  )
) {
  dotenv.config({
    path:
      serverEnvPath
  });
} else if (
  fs.existsSync(
    rootEnvPath
  )
) {
  dotenv.config({
    path:
      rootEnvPath
  });
} else {
  dotenv.config();
}

/*
|--------------------------------------------------------------------------
| DNS
|--------------------------------------------------------------------------
|
| Local Windows/ISP DNS environments ke liye MongoDB Atlas SRV fallback.
| Production hosting par platform DNS override nahi karte.
|
*/

const dns =
  require("node:dns");

if (
  process.env.NODE_ENV !==
  "production"
) {
  dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
  ]);
}

/*
|--------------------------------------------------------------------------
| HTTP
|--------------------------------------------------------------------------
*/

const http =
  require("http");

/*
|--------------------------------------------------------------------------
| Actual Backend App
|--------------------------------------------------------------------------
*/

const app =
  require(
    "./server/src/app"
  );

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

const {
  connectDatabase,
  disconnectDatabase
} = require(
  "./server/src/config/database"
);

/*
|--------------------------------------------------------------------------
| Admin Bootstrap / One-Time Reset
|--------------------------------------------------------------------------
*/

const {
  syncAdminBootstrap
} = require(
  "./server/src/utils/adminBootstrap"
);

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const {
  createSocketServer,
  closeSocketServer
} = require(
  "./server/src/sockets/socketServer"
);

/*
|--------------------------------------------------------------------------
| Server Configuration
|--------------------------------------------------------------------------
*/

const PORT =
  Number(
    process.env.PORT
  ) || 5001;

const HOST =
  "0.0.0.0";

const httpServer =
  http.createServer(
    app
  );

/*
|--------------------------------------------------------------------------
| Socket.IO Initialize
|--------------------------------------------------------------------------
*/

const io =
  createSocketServer(
    httpServer
  );

/*
|--------------------------------------------------------------------------
| Express App Socket Reference
|--------------------------------------------------------------------------
|
| Controllers/services ko Socket.IO instance access dene ke liye.
|
*/

app.set(
  "io",
  io
);

/*
|--------------------------------------------------------------------------
| Shutdown State
|--------------------------------------------------------------------------
*/

let isShuttingDown =
  false;

/*
|--------------------------------------------------------------------------
| Startup Diagnostics
|--------------------------------------------------------------------------
*/

const logStartupConfiguration =
  () => {
    const environment =
      process.env.NODE_ENV ||
      "development";

    const adminEmail =
      String(
        process.env
          .ADMIN_EMAIL ||
          ""
      )
        .trim()
        .toLowerCase();

    const adminResetEnabled =
      [
        "1",
        "true",
        "yes",
        "on"
      ].includes(
        String(
          process.env
            .ADMIN_RESET_ON_START ||
            ""
        )
          .trim()
          .toLowerCase()
      );

    console.log("");
    console.log(
      "----------------------------------------"
    );
    console.log(
      "HimRideG Root Server Configuration"
    );
    console.log(
      `Environment: ${environment}`
    );
    console.log(
      `Host: ${HOST}`
    );
    console.log(
      `Port: ${PORT}`
    );

    if (adminEmail) {
      console.log(
        `Admin Email: ${adminEmail}`
      );
    } else {
      console.log(
        "Admin Email: not configured"
      );
    }

    console.log(
      `Admin Reset On Start: ${
        adminResetEnabled
          ? "ENABLED"
          : "disabled"
      }`
    );

    console.log(
      "----------------------------------------"
    );
    console.log("");
  };

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer =
  async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Startup Configuration
      |--------------------------------------------------------------------------
      */

      logStartupConfiguration();

      /*
      |--------------------------------------------------------------------------
      | MongoDB
      |--------------------------------------------------------------------------
      */

      await connectDatabase();

      /*
      |--------------------------------------------------------------------------
      | Admin Bootstrap / One-Time Password Reset
      |--------------------------------------------------------------------------
      |
      | Behaviour:
      |
      | - Admin missing:
      |   ADMIN_EMAIL + ADMIN_BOOTSTRAP_PASSWORD se create.
      |
      | - Admin exists and ADMIN_RESET_ON_START false:
      |   existing admin untouched.
      |
      | - Admin exists and ADMIN_RESET_ON_START true:
      |   password ADMIN_BOOTSTRAP_PASSWORD se safely reset.
      |
      | Reset successful hone ke baad Render/local env me
      | ADMIN_RESET_ON_START=false/remove karna hai.
      |
      */

      const adminBootstrapResult =
        await syncAdminBootstrap();

      if (
        adminBootstrapResult
      ) {
        console.log(
          `Admin bootstrap action: ${
            adminBootstrapResult
              .action ||
            "unknown"
          }`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | HTTP Listen
      |--------------------------------------------------------------------------
      */

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
              process.env
                .NODE_ENV ||
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
            "📂 Entry: ROOT server.js"
          );
          console.log(
            "📂 Backend: server/src"
          );
          console.log(
            "========================================"
          );
          console.log("");
        }
      );
    } catch (
      error
    ) {
      console.error("");
      console.error(
        "❌ HimRideG v2 server start nahi ho saka."
      );
      console.error(
        `Reason: ${
          error?.message ||
          error
        }`
      );
      console.error("");

      /*
      |--------------------------------------------------------------------------
      | Startup Failure — Close Socket.IO
      |--------------------------------------------------------------------------
      */

      try {
        await closeSocketServer();
      } catch (
        socketError
      ) {
        console.error(
          "Socket close error:",
          socketError.message
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Startup Failure — Disconnect MongoDB
      |--------------------------------------------------------------------------
      */

      try {
        await disconnectDatabase();
      } catch (
        databaseError
      ) {
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

const shutdown =
  async (
    signal
  ) => {
    if (
      isShuttingDown
    ) {
      return;
    }

    isShuttingDown =
      true;

    console.log("");
    console.log(
      `${signal} received. Server close ho raha hai...`
    );

    /*
    |--------------------------------------------------------------------------
    | Force Shutdown Safety Timer
    |--------------------------------------------------------------------------
    */

    const forceShutdownTimer =
      setTimeout(
        () => {
          console.error(
            "❌ Forced shutdown"
          );

          process.exit(1);
        },
        10000
      );

    forceShutdownTimer.unref();

    /*
    |--------------------------------------------------------------------------
    | Close Socket.IO
    |--------------------------------------------------------------------------
    */

    try {
      await closeSocketServer();

      console.log(
        "✅ Socket.IO closed"
      );
    } catch (
      error
    ) {
      console.error(
        "Socket shutdown error:",
        error.message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Close HTTP Server
    |--------------------------------------------------------------------------
    */

    httpServer.close(
      async (
        error
      ) => {
        if (
          error
        ) {
          console.error(
            "HTTP shutdown error:",
            error.message
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Disconnect MongoDB
        |--------------------------------------------------------------------------
        */

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
            error
              ? 1
              : 0
          );
        } catch (
          databaseError
        ) {
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
| SIGINT
|--------------------------------------------------------------------------
*/

process.on(
  "SIGINT",
  () => {
    shutdown(
      "SIGINT"
    );
  }
);

/*
|--------------------------------------------------------------------------
| SIGTERM
|--------------------------------------------------------------------------
*/

process.on(
  "SIGTERM",
  () => {
    shutdown(
      "SIGTERM"
    );
  }
);

/*
|--------------------------------------------------------------------------
| Unhandled Promise Rejection
|--------------------------------------------------------------------------
*/

process.on(
  "unhandledRejection",
  (
    error
  ) => {
    console.error(
      "Unhandled rejection:",
      error
    );

    shutdown(
      "UNHANDLED_REJECTION"
    );
  }
);

/*
|--------------------------------------------------------------------------
| Uncaught Exception
|--------------------------------------------------------------------------
*/

process.on(
  "uncaughtException",
  (
    error
  ) => {
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
