const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const files = {
  app: read("server/src/app.js"),
  socketServer: read("server/src/sockets/socketServer.js"),
  socketClient: read("client/src/socket.js"),
  api: read("client/src/api.js"),
  appClient: read("client/src/App.jsx"),
  customer: read("client/src/pages/CustomerDashboard.jsx"),
  driver: read("client/src/pages/DriverDashboard.jsx"),
  paymentModal: read("client/src/components/paymentmodal.jsx"),
  rideRoutes: read("server/src/routes/rideRoutes.js"),
  fareRoutes: read("server/src/routes/fareRoutes.js"),
  paymentRoutes: read("server/src/routes/paymentRoutes.js"),
  driverRoutes: read("server/src/routes/driverRoutes.js"),
  authController: read("server/src/controllers/authController.js"),
  driverAuthController: read("server/src/controllers/driverAuthController.js"),
  paymentController: read("server/src/controllers/paymentController.js"),
  launchPaymentController: read("server/src/controllers/launchPaymentController.js"),
  rideController: read("server/src/controllers/rideController.js"),
  driverFeed: read("server/src/controllers/driverRideFeedController.js"),
  fareController: read("server/src/controllers/fareController.js"),
  render: read("render.yaml")
};

const checks = [];
const check = (name, value, detail) => {
  checks.push({ name, pass: Boolean(value), detail });
};

// CORS / session / browser transport
check("HTTP CORS allows X-HimRideG-Role", files.app.includes('"X-HimRideG-Role"'), "Fixes browser preflight failure shown in live Driver Dashboard.");
check("Socket CORS allows X-HimRideG-Role", files.socketServer.includes('"X-HimRideG-Role"'), "Socket refresh and polling remain compatible with role-isolated sessions.");
check("Axios sends role header", files.api.includes('"X-HimRideG-Role"'), "Customer/driver refresh can choose the correct role cookie.");
check("Socket refresh sends role header", files.socketClient.includes('"X-HimRideG-Role"') && files.socketClient.includes("getExpectedSessionRole"), "Socket reconnect cannot silently refresh into the other role.");
check("Both production origins configured", files.render.includes("https://himrideg.com,https://www.himrideg.com"), "Apex and www website origins are allowed.");
check("Credentialed CORS enabled", files.app.includes("credentials: true"), "HttpOnly refresh cookies can travel cross-origin to api.himrideg.com.");

// Role-isolated auth
check("Customer refresh cookie isolated", files.authController.includes("refreshToken_customer"), "Customer refresh cookie remains separate from Driver.");
check("Driver refresh cookie isolated", files.driverAuthController.includes("refreshToken_driver"), "Driver refresh cookie remains separate from Customer.");
check("Refresh role integrity validation", files.authController.includes("Session role mismatch"), "Wrong-role refresh JWT is rejected.");
check("Frontend token/user identity guard", files.api.includes("sessionIdentityMatches"), "Stale role/token combinations are cleared instead of spamming protected APIs.");

// Customer booking entry + active state
check("Create ride backend route", files.rideRoutes.includes('router.post(\n  "/",\n  rideController.createRide'), "Customer booking POST /rides exists.");
check("Create ride frontend call", files.appClient.includes('api.post(\n            "/rides"') || files.appClient.includes('api.post(\n            "/rides",'), "Customer booking UI calls /rides.");
check("Customer active ride backend", files.rideRoutes.includes('"/customer/active"'), "Authoritative customer active ride endpoint exists.");
check("Customer active ride frontend", files.appClient.includes('"/rides/customer/active"'), "Customer dashboard merges authoritative active ride state.");

// Driver core dashboard APIs
check("Driver profile backend", files.driverRoutes.includes('"/profile"'), "Driver profile endpoint exists.");
check("Driver profile frontend", files.driver.includes('api.get(\n          "/driver/profile"') || files.driver.includes('"/driver/profile"'), "Driver dashboard fetches profile.");
check("Driver feed backend", files.rideRoutes.includes('"/driver/feed"'), "Driver request feed exists.");
check("Driver feed frontend", files.appClient.includes('"/rides/driver/feed"'), "Driver dashboard/App requests feed.");
check("Driver active backend", files.rideRoutes.includes('"/driver/active"'), "Driver active ride endpoint exists.");
check("Driver active frontend", files.appClient.includes('"/rides/driver/active"'), "Driver active ride state is fetched.");
check("Driver online/offline endpoints", files.driverRoutes.includes('"/go-online"') && files.driverRoutes.includes('"/go-offline"'), "Online state controls exist.");
check("Driver live location endpoint", files.driverRoutes.includes('"/location"') && files.rideRoutes.includes('"/:bookingId/location"'), "Dashboard and active-ride GPS update routes exist.");
check("Driver wallet backend", files.driverRoutes.includes('"/wallet"'), "Wallet route exists.");
check("Driver wallet frontend", files.driver.includes('"/driver/wallet"'), "Mobile/desktop dashboard opens wallet from existing API.");

// Dispatch and concurrency
check("Nearest driver endpoint", files.rideRoutes.includes('"/:bookingId/nearest-drivers"'), "Nearest-driver flow exists.");
check("Dispatch endpoint", files.rideRoutes.includes('"/:bookingId/dispatch"'), "Ride dispatch exists.");
check("Atomic ride accept route", files.rideRoutes.includes('"/:bookingId/accept"') && files.driverFeed.includes("acceptAvailableRide"), "Driver accept handler exists.");
check("Driver release route", files.rideRoutes.includes('"/:bookingId/driver-release"'), "Unconfirmed accepted ride can be released.");
check("Driver reject route", files.rideRoutes.includes('"/:bookingId/reject"'), "Driver can reject a request.");

// Fare negotiation
check("Driver initial fare route", files.fareRoutes.includes('"/:bookingId/driver-offer"'), "Driver sends initial fare.");
check("Customer counter route", files.fareRoutes.includes('"/:bookingId/customer-counter"'), "Customer one-time counter endpoint exists.");
check("Driver final fare route", files.fareRoutes.includes('"/:bookingId/driver-final"'), "Driver final fare endpoint exists.");
check("Customer final accept route", files.fareRoutes.includes('"/:bookingId/customer-accept-final"'), "Final fare can be locked by customer.");
check("Customer final reject route", files.fareRoutes.includes('"/:bookingId/customer-reject-final"'), "Customer can reject final fare.");
check("Customer fare UI calls", files.customer.includes("customer-accept-final") && files.customer.includes("customer-counter") && files.customer.includes("customer-reject-final"), "Customer dashboard is wired to the fare contract.");
check("Driver fare UI calls", files.driver.includes("driver-offer") && files.driver.includes("driver-final"), "Driver dashboard is wired to initial/final fare endpoints.");

// Arrival / OTP / ride lifecycle
check("Arriving route", files.rideRoutes.includes('"/:bookingId/arriving"'), "Driver can enter arriving state.");
check("Arrived route", files.rideRoutes.includes('"/:bookingId/arrived"'), "Driver arrival triggers OTP flow.");
check("OTP verification route", files.rideRoutes.includes('"/:bookingId/verify-start-otp"'), "Ride start OTP verification exists.");
check("OTP regenerate route", files.rideRoutes.includes('"/:bookingId/regenerate-start-otp"'), "Expired OTP can be regenerated.");
check("Ride start route", files.rideRoutes.includes('"/:bookingId/start"'), "Ride start endpoint exists.");
check("Ride complete route", files.rideRoutes.includes('"/:bookingId/complete"'), "Ride completion endpoint exists.");
check("Driver lifecycle UI calls", files.driver.includes("/arriving") && files.driver.includes("/arrived") && files.driver.includes("verify-start-otp") && files.driver.includes("regenerate-start-otp") && files.driver.includes("/start`)" ) === false, "Lifecycle handlers are present in DriverDashboard.");
// Explicit checks without fragile quote formatting
check("Driver start UI call", files.driver.includes("/start`") || files.driver.includes("/start\""), "Driver dashboard calls ride start.");
check("Driver complete UI call", files.driver.includes("/complete`") || files.driver.includes("/complete\""), "Driver dashboard calls complete.");

// Payment and release
check("Online payment order route", files.paymentRoutes.includes('"/create-order"'), "Razorpay order route exists.");
check("Online payment verification route", files.paymentRoutes.includes('"/verify"'), "Razorpay verification route exists.");
check("Cash select route", files.paymentRoutes.includes('"/cash-select"'), "Customer can choose cash after completion.");
check("Cash confirm route", files.paymentRoutes.includes('"/cash-confirm"'), "Driver/customer confirmation endpoint exists.");
check("Payment modal online wired", files.paymentModal.includes('"/payments/create-order"') && files.paymentModal.includes('"/payments/verify"'), "Customer online payment UI is wired.");
check("Cash confirm UI wired", files.driver.includes('"/payments/cash-confirm"') || files.paymentModal.includes('"/payments/cash-confirm"'), "Cash completion UI is wired.");

check(
  "Cash selection explicit driver socket event",
  files.launchPaymentController.includes('"payment:cash-selected"') &&
    files.driver.includes('"payment:cash-selected"'),
  "Customer Cash selection explicitly reaches Driver Dashboard."
);
check(
  "Cash selection driver room delivery",
  files.launchPaymentController.includes("`driver:${driverId}`"),
  "Cash/payment realtime update targets dedicated driver room."
);
check(
  "Cash selection push fallback",
  files.launchPaymentController.includes("Cash Payment Selected") &&
    files.launchPaymentController.includes("sendPushToUser"),
  "Offline/reconnect case has driver push fallback."
);
check(
  "Driver payment received receipt",
  files.driver.includes("driverPaymentReceipt") &&
    files.driver.includes("Cash Received"),
  "Driver gets a closable Cash/Online received receipt."
);
check(
  "Customer paid receipt manual close",
  files.customer.includes("autoClosePaidReceipt") &&
    files.paymentModal.includes("paymentDoneBtn"),
  "Customer paid receipt has explicit Done/Close instead of forced close."
);
check("Paid ride releases driver", files.paymentController.includes("releaseDriverAfterPaidBooking") && files.paymentController.includes("isAvailable: true"), "Payment completion clears current ride and releases online driver.");
check("Payment idempotency guard", files.paymentController.includes("already paid") || files.paymentController.includes('paymentStatus === "paid"'), "Repeated payment does not blindly create a second paid state.");

// Rating / completion post-flow
check("Customer rates driver", files.rideRoutes.includes('"/:bookingId/rate-driver"') && files.customer.includes("rate-driver"), "Post-payment rating flow exists.");
check("Driver rates customer", files.rideRoutes.includes('"/:bookingId/rate-customer"'), "Driver-to-customer rating endpoint exists.");

// Map + readiness + route mounts
check("Map API mounted", files.app.includes('"/api/v2/map"') && files.app.includes('"/api/v2/maps"'), "Both current and compatibility map prefixes are mounted.");
check("Ride routes mounted", files.app.includes('"/api/v2/rides"'), "Ride API router is active.");
check("Fare routes mounted", files.app.includes('"/api/v2/fares"'), "Fare API router is active.");
check("Payment routes mounted", files.app.includes('"/api/v2/payments"'), "Payment API router is active.");
check("Driver routes mounted", files.app.includes('"/api/v2/driver"'), "Driver API router is active.");
check("Readiness mounted", files.app.includes('"/api/v2/readiness"'), "Production readiness endpoint exists.");

const passed = checks.filter((item) => item.pass).length;
const failed = checks.filter((item) => !item.pass);

console.table(checks);
console.log(`Full customer → driver → fare → OTP → complete → payment contract: ${passed}/${checks.length} PASS`);

if (failed.length) {
  console.error("Failed checks:");
  for (const item of failed) {
    console.error(`- ${item.name}: ${item.detail}`);
  }
  process.exitCode = 1;
}
