from pathlib import Path

code = r'''require("dotenv").config();

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
| Environment Helpers
|--------------------------------------------------------------------------
*/

const cleanEnv = (name) =>
  String(
    process.env[name] || ""
  ).trim();

const envFlag = (name) => {
  const value =
    cleanEnv(name)
      .toLowerCase();

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(value);
};

/*
|--------------------------------------------------------------------------
| Admin Bootstrap Password Validation
|--------------------------------------------------------------------------
*/

const validateAdminBootstrapPassword = (
  password
) => {
  if (!password) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD environment variable required hai"
    );
  }

  if (password.length < 16) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD minimum 16 characters ka hona chahiye"
    );
  }

  if (
    /change|password|himrideg@123/i.test(
      password
    )
  ) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD placeholder/default nahi ho sakta"
    );
  }
};

/*
|--------------------------------------------------------------------------
| Admin Bootstrap / One-Time Password Reset
|--------------------------------------------------------------------------
|
| Normal behaviour:
| - ADMIN_EMAIL missing ho to bootstrap skip.
| - Admin missing ho to ADMIN_BOOTSTRAP_PASSWORD se create.
| - Existing admin ko normal startup par touch nahi karte.
|
| One-time reset:
| - Sirf ADMIN_RESET_ON_START=true hone par existing admin password
|   ADMIN_BOOTSTRAP_PASSWORD se reset hota hai.
| - Reset ke baad ADMIN_RESET_ON_START=false/remove karna compulsory hai.
|
*/

async function bootstrapAdmin() {
  try {
    const Admin =
      require("./src/models/Admin");

    const email =
      cleanEnv(
        "ADMIN_EMAIL"
      ).toLowerCase();

    const password =
      cleanEnv(
        "ADMIN_BOOTSTRAP_PASSWORD"
      );

    const shouldReset =
      envFlag(
        "ADMIN_RESET_ON_START"
      );

    /*
    |--------------------------------------------------------------------------
    | Admin Email Required
    |--------------------------------------------------------------------------
    */

    if (!email) {
      console.log(
        "⚠️ ADMIN_EMAIL set nahi hai — admin bootstrap skip."
      );

      return {
        action: "skipped",
        reason:
          "ADMIN_EMAIL_MISSING"
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Admin
    |--------------------------------------------------------------------------
    */

    const existing =
      await Admin.findOne({
        email
      });

    /*
    |--------------------------------------------------------------------------
    | Existing Admin — Normal Startup
    |--------------------------------------------------------------------------
    */

    if (
      existing &&
      !shouldReset
    ) {
      console.log(
        "✅ Admin already exists:",
        email
      );

      console.log(
        "✅ Admin account ready:",
        email
      );

      return {
        action: "unchanged",
        adminId:
          String(existing._id),
        email
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Create / Reset Requires Valid Password
    |--------------------------------------------------------------------------
    */

    validateAdminBootstrapPassword(
      password
    );

    /*
    |--------------------------------------------------------------------------
    | Existing Admin — Explicit One-Time Password Reset
    |--------------------------------------------------------------------------
    */

    if (
      existing &&
      shouldReset
    ) {
      existing.password =
        password;

      if (!existing.name) {
        existing.name =
          "HimRideG Admin";
      }

      existing.role =
        "admin";

      await existing.save();

      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "✅ ADMIN PASSWORD RESET SUCCESSFUL"
      );
      console.log(
        `📧 Admin: ${email}`
      );
      console.log(
        "🔐 Password bcrypt hash ke saath database me update hua."
      );
      console.log(
        "⚠️ SECURITY: Ab ADMIN_RESET_ON_START ko false/remove karo."
      );
      console.log(
        "=========================================="
      );
      console.log("");

      return {
        action: "reset",
        adminId:
          String(existing._id),
        email
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Missing — Create
    |--------------------------------------------------------------------------
    */

    const createdAdmin =
      await Admin.create({
        name:
          "HimRideG Admin",
        email,
        password,
        role:
          "admin"
      });

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "✅ Admin Bootstrap Successful!"
    );
    console.log(
      "✅ ADMIN CREATED SUCCESSFULLY"
    );
    console.log(
      `📧 Email: ${email}`
    );
    console.log(
      "🔐 Password bcrypt hash ke saath database me save hua."
    );
    console.log(
      "=========================================="
    );
    console.log("");

    return {
      action: "created",
      adminId:
        String(createdAdmin._id),
      email
    };
  } catch (err) {
    console.error("");
    console.error(
      "❌ Admin bootstrap/reset error:",
      err.message
    );
    console.error("");

    /*
    | Admin bootstrap failure ko silently ignore nahi karna.
    | Startup catch ko error denge taaki broken auth ke saath
    | production server live na ho.
    */

    throw err;
  }
}

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
    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    */

    await connectDatabase();

    /*
    |--------------------------------------------------------------------------
    | Admin Auto-Bootstrap / One-Time Reset
    |--------------------------------------------------------------------------
    */

    await bootstrapAdmin();

    /*
    |--------------------------------------------------------------------------
    | HTTP Server
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

const shutdown = async (
  signal
) => {
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

  /*
  |--------------------------------------------------------------------------
  | Close Socket.IO
  |--------------------------------------------------------------------------
  */

  try {
    await closeSocketServer();
  } catch (error) {
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
    async (error) => {
      if (error) {
        console.error(
          "HTTP shutdown error:",
          error.message
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Disconnect Database
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
          error ? 1 : 0
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
| Process Events
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

process.on(
  "SIGTERM",
  () => {
    shutdown(
      "SIGTERM"
    );
  }
);

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
'''

path = Path("/mnt/data/ROOT_server.js")
path.write_text(code, encoding="utf-8")
print(f"Created {path} with {len(code.splitlines())} lines")
