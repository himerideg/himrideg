/*
|--------------------------------------------------------------------------
| HimRideG Ride/Fare/Payment Contract Audit — Phase 4
|--------------------------------------------------------------------------
| Static read-only audit. No production mutation, no payment call.
*/

const fs = require("node:fs");
const path = require("node:path");

const serverRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(
    path.join(serverRoot, relativePath),
    "utf8"
  );
}

const fareRoutes = read("src/routes/fareRoutes.js");
const rideRoutes = read("src/routes/rideRoutes.js");
const paymentRoutes = read("src/routes/paymentRoutes.js");
const fareController = read("src/controllers/fareController.js");
const rideController = read("src/controllers/rideController.js");
const webhookController = read("src/controllers/razorpayWebhookController.js");

const checks = [
  [
    "driver initial fare route",
    fareRoutes.includes('/:bookingId/driver-offer')
  ],
  [
    "customer one-time counter route",
    fareRoutes.includes('/:bookingId/customer-counter')
  ],
  [
    "driver final fare route",
    fareRoutes.includes('/:bookingId/driver-final')
  ],
  [
    "customer final accept route",
    fareRoutes.includes('/:bookingId/customer-accept-final')
  ],
  [
    "customer final reject route",
    fareRoutes.includes('/:bookingId/customer-reject-final')
  ],
  [
    "fare controller persists final fare",
    fareController.includes("finalFare") &&
      fareController.includes("fare_accepted")
  ],
  [
    "ride accept endpoint/handler present",
    /accept/i.test(rideRoutes) && /accept/i.test(rideController)
  ],
  [
    "cash payment confirmation route",
    paymentRoutes.includes('/cash-confirm')
  ],
  [
    "online payment verification route",
    paymentRoutes.includes('/verify')
  ],
  [
    "durable gateway webhook",
    webhookController.includes("claimDurableEvent") &&
      webhookController.includes("processDurableRazorpayWebhookJob")
  ]
];

let failures = 0;

for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}`);
  if (!pass) failures += 1;
}

console.log(`Ride flow contract: ${checks.length - failures}/${checks.length} PASS`);

if (failures) {
  process.exitCode = 1;
}
