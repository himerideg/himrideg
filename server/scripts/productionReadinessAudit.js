/*
|--------------------------------------------------------------------------
| HimRideG Phase 4 Production Readiness Static Audit
|--------------------------------------------------------------------------
| Read-only. It does not contact payment gateways or create rides.
*/

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const checks = [];

function check(name, condition, detail) {
  checks.push({
    name,
    pass: Boolean(condition),
    detail
  });
}

const renderYaml = read("render.yaml");
const appJs = read("client/src/App.jsx");
const mainJsx = read("client/src/main.jsx");
const homeJs = read("client/src/pages/Home.jsx");
const mapController = read("server/src/controllers/mapController.js");
const webhookController = read("server/src/controllers/razorpayWebhookController.js");
const sharedUploadService = read("server/src/services/sharedUploadStorageService.js");
const productionServer = read("server/server.js");
const customerDashboard = read("client/src/pages/CustomerDashboard.jsx");
const rideService = read("server/src/services/rideService.js");

check(
  "Redis enabled in Render blueprint",
  renderYaml.includes("REDIS_ENABLED") && renderYaml.includes('value: "true"'),
  "Redis remains optional at runtime through REDIS_REQUIRED=false."
);

check(
  "Phase 3 distributed availability exposed to Render",
  renderYaml.includes("DISTRIBUTED_DRIVER_AVAILABILITY_ENABLED"),
  "Required for multi-instance driver registry."
);

check(
  "Atomic ride accept distributed lock exposed to Render",
  renderYaml.includes("RIDE_ACCEPT_DISTRIBUTED_LOCK_ENABLED"),
  "Protects same ride accept across multiple Node instances."
);

check(
  "Frontend dashboard route lazy loading",
  appJs.includes("React.lazy") && mainJsx.includes("React.Suspense"),
  "Large dashboard screens should not inflate initial home bundle."
);

check(
  "Public booking map lazy loading",
  homeJs.includes("React.lazy") &&
    homeJs.includes("HomeBookRide"),
  "Leaflet booking code should load only when customer opens booking."
);

check(
  "Socket-first fallback polling",
  appJs.includes("REALTIME_FALLBACK_POLL_MS"),
  "Polling is fallback instead of primary realtime transport."
);

check(
  "Distributed map cache",
  mapController.includes("cachedAcrossInstances") &&
    mapController.includes("saveCacheAcrossInstances"),
  "Geoapify results are reusable across server instances."
);

check(
  "Durable payment webhook ACK",
  webhookController.includes("claimDurableEvent") &&
    webhookController.includes("recoverPendingDurableRazorpayWebhooks"),
  "Verified webhook is persisted before successful ACK."
);

check(
  "Shared upload storage for scale-out",
  renderYaml.includes("UPLOAD_STORAGE_MODE") &&
    sharedUploadService.includes("GridFSBucket") &&
    sharedUploadService.includes("migrateLocalUploadsToSharedStorage") &&
    productionServer.includes("migrateLocalUploadsToSharedStorage()"),
  "Existing disk files stay primary while GridFS mirror enables multi-instance access."
);

check(
  "Map-first fare negotiation sheet",
  customerDashboard.includes("cvMapFareSheet") &&
    customerDashboard.includes("showMapFareSheet"),
  "Existing fare handlers remain while customer negotiation renders over the live map."
);

check(
  "Nearest-driver scalable prefilter",
  rideService.includes("findNearbyAvailableDriverIds") ||
    rideService.includes("distributedDriverAvailability"),
  "Redis GEO prefilter should supplement MongoDB verification."
);

const failed = checks.filter((item) => !item.pass);

console.table(checks);
console.log(`PASS ${checks.length - failed.length}/${checks.length}`);

if (failed.length) {
  process.exitCode = 1;
}
