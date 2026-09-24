const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    console.error("HimRideG V74 target file missing:", file);
    process.exit(1);
  }
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

/*
|=============================================================================
| V74 — CROSS-DEVICE ACTIVE RIDE SYNC
|=============================================================================
| FULL CODE RULE:
| - existing dashboard/request/fare/payment/map code untouched
| - only additive active-ride focus + cache-busting active-state request
| - incoming NEW requests still do NOT auto-open
| - only a ride already assigned to this driver is auto-focused
|=============================================================================
*/

const driverFile = path.join(root, "src", "pages", "DriverDashboard.jsx");
let driverSource = read(driverFile);
const driverMarker = "V74 Cross-device Active Ride Focus";

if (!driverSource.includes(driverMarker)) {
  const driverAnchor = `  /*\n  |------------------------------------------------------------------------\n  | V63 Persistent Live GPS Source\n  |------------------------------------------------------------------------`;

  if (!driverSource.includes(driverAnchor)) {
    console.error("HimRideG V74 driver anchor not found; refusing unsafe patch.");
    process.exit(1);
  }

  const driverAddition = `  /*\n  |------------------------------------------------------------------------\n  | V74 Cross-device Active Ride Focus — ADD-ONLY\n  |------------------------------------------------------------------------\n  | Mobile app / dusre browser par already assigned active ride website par\n  | hydrate hote hi dashboard us ride ko khud open kare. Nayi unassigned ride\n  | requests ka existing manual tap rule bilkul unchanged rahega.\n  |------------------------------------------------------------------------\n  */\n  const blockingCurrentRideId =\n    getId(blockingCurrentRide);\n\n  useEffect(() => {\n    if (!blockingCurrentRideId) {\n      return;\n    }\n\n    setSelectedRideId((currentSelectedId) =>\n      currentSelectedId ||\n      blockingCurrentRideId\n    );\n  }, [blockingCurrentRideId]);\n\n`;

  driverSource = driverSource.replace(
    driverAnchor,
    `${driverAddition}${driverAnchor}`
  );
  write(driverFile, driverSource);
  console.log("HimRideG V74 active ride focus applied: src/pages/DriverDashboard.jsx");
} else {
  console.log("HimRideG V74 active ride focus already applied");
}

/*
|--------------------------------------------------------------------------
| Dynamic active endpoint must not be lost to browser ETag/304 handling.
| A unique query value is harmless to Express but guarantees a fresh GET.
| Feed endpoint remains unchanged.
|--------------------------------------------------------------------------
*/
const appFile = path.join(root, "src", "App.jsx");
let appSource = read(appFile);
const appMarker = "V74_ACTIVE_RIDE_FRESH_SYNC";

if (!appSource.includes(appMarker)) {
  const oldActiveCall = `              api.get(\n                activeEndpoint\n              )`;

  if (!appSource.includes(oldActiveCall)) {
    console.error("HimRideG V74 App active endpoint anchor not found; refusing unsafe patch.");
    process.exit(1);
  }

  const newActiveCall = `              api.get(\n                activeEndpoint,\n                {\n                  params: {\n                    /* V74_ACTIVE_RIDE_FRESH_SYNC */\n                    _activeSync:\n                      Date.now()\n                  }\n                }\n              )`;

  appSource = appSource.replace(oldActiveCall, newActiveCall);
  write(appFile, appSource);
  console.log("HimRideG V74 fresh active ride sync applied: src/App.jsx");
} else {
  console.log("HimRideG V74 fresh active ride sync already applied");
}
