const path = require("node:path");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const {
  driverProfileDirectory
} = require("./config/uploads");

const authRoutes = require("./routes/authRoutes");
const driverAuthRoutes = require("./routes/driverAuthRoutes");
const driverRoutes = require("./routes/driverRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const rideRoutes = require("./routes/rideRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const fareRoutes = require("./routes/fareRoutes");

const mapRoutes = require("./routes/mapRoutes");
const walletRoutes = require("./routes/walletRoutes");
const launchPaymentController = require("./controllers/launchPaymentController");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

/*
|--------------------------------------------------------------------------
| Reverse Proxy
|--------------------------------------------------------------------------
|
| Render/Vercel style HTTPS reverse proxies ke peeche req.protocol aur
| secure-cookie behavior sahi rakhne ke liye.
|
*/

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = String(
  process.env.CLIENT_URL || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/*
|--------------------------------------------------------------------------
| Local Development Origins
|--------------------------------------------------------------------------
|
| Ye localhost ke saath local Wi-Fi IPs ko bhi allow karta hai:
|
| localhost
| 127.0.0.1
| 10.x.x.x
| 192.168.x.x
| 172.16.x.x - 172.31.x.x
|
| Isliye mobile se:
| http://10.138.247.5:5173
| bhi allow hoga.
|
*/

const localDevelopmentOrigin =
  /^http:\/\/(?:localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/i;

const corsOptions = {
  origin(origin, callback) {
    /*
    |--------------------------------------------------------------------------
    | No Origin
    |--------------------------------------------------------------------------
    |
    | Postman, native mobile app,
    | server-to-server request etc.
    |
    */

    if (!origin) {
      return callback(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | Environment Configured Origins
    |--------------------------------------------------------------------------
    */

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | Local Development
    |--------------------------------------------------------------------------
    */

    const isLocalDevelopment =
      process.env.NODE_ENV !== "production" &&
      localDevelopmentOrigin.test(origin);

    if (isLocalDevelopment) {
      return callback(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | Block Unknown Origin
    |--------------------------------------------------------------------------
    */

    console.error(
      `❌ CORS blocked origin: ${origin}`
    );

    return callback(
      new Error(
        `CORS blocked origin: ${origin}`
      )
    );
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
    "Authorization"
  ],

  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Razorpay Webhook — RAW BODY MUST COME BEFORE express.json()
|--------------------------------------------------------------------------
|
| Razorpay webhook signature raw request body se verify hoti hai. Isliye
| is route ko JSON body parser se pehle mount kiya gaya hai.
|
*/
app.post(
  "/api/v2/payments/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  launchPaymentController.razorpayWebhook
);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(compression());

app.use(cookieParser());

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb"
  })
);

/*
|--------------------------------------------------------------------------
| Static Uploads
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads/drivers/profile",
  express.static(
    driverProfileDirectory,
    {
      maxAge:
        process.env.NODE_ENV ===
        "production"
          ? "7d"
          : 0,

      fallthrough: false
    }
  )
);

/*
|--------------------------------------------------------------------------
| Logger
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Root Probe + Health Check
|--------------------------------------------------------------------------
|
| Render, uptime monitors and browser probes often request / or HEAD /.
| Keep the versioned health endpoint below and add a lightweight root probe
| so a healthy backend does not look like a 404 to infrastructure checks.
|
*/

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,
      service: "HimRideG API",
      health: "/api/v2/health",
      timestamp: new Date().toISOString()
    });
  }
);

app.head(
  "/",
  (req, res) => {
    return res.sendStatus(200);
  }
);

app.get(
  "/api/v2/health",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "HimRideG backend is healthy",

      data: {
        environment:
          process.env.NODE_ENV ||
          "development",

        timestamp:
          new Date().toISOString()
      }
    });
  }
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v2/auth",
  authRoutes
);

app.use(
  "/api/v2/maps",
  mapRoutes
);

app.use(
  "/api/v2/wallet",
  walletRoutes
);

app.use(
  "/api/v2/driver/auth",
  driverAuthRoutes
);

app.use(
  "/api/v2/driver",
  driverRoutes
);

app.use(
  "/api/v2/bookings",
  bookingRoutes
);

app.use(
  "/api/v2/rides",
  rideRoutes
);

app.use(
  "/api/v2/admin",
  adminRoutes
);

app.use(
  "/api/v2/payments",
  paymentRoutes
);

app.use(
  "/api/v2/fares",
  fareRoutes
);

/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

module.exports = app;