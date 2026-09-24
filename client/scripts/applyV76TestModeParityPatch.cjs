const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/pages/DriverDashboard.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG V76 target missing: src/pages/DriverDashboard.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");
const marker = "V76_TEST_MODE_PARITY";

if (!source.includes(marker)) {
  const oldBlock =
    '  const openV75RideRequest = useCallback((rideId) => {\n' +
    '    if (Number(v75PlatformFee.due || 0) > 0) {\n' +
    '      setV75FeePromptOpen(true);\n' +
    '    }\n\n' +
    '    if (!v75PlatformFee.blocked) {\n' +
    '      setSelectedRideId(rideId);\n' +
    '    }\n' +
    '  }, [v75PlatformFee.due, v75PlatformFee.blocked]);';

  const newBlock =
    '  /* V76_TEST_MODE_PARITY */\n' +
    '  const openV75RideRequest = useCallback((rideId) => {\n' +
    '    if (v75PlatformFee.reminderRequired && !v75PlatformFee.testMode) {\n' +
    '      setV75FeePromptOpen(true);\n' +
    '    }\n\n' +
    '    if (!v75PlatformFee.blocked) {\n' +
    '      setSelectedRideId(rideId);\n' +
    '    }\n' +
    '  }, [v75PlatformFee.reminderRequired, v75PlatformFee.testMode, v75PlatformFee.blocked]);';

  if (!source.includes(oldBlock)) {
    console.error("HimRideG V76 driver test-mode anchor missing");
    process.exit(1);
  }

  source = source.replace(oldBlock, newBlock);
  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V76 test-mode ride parity applied: src/pages/DriverDashboard.jsx");
} else {
  console.log("HimRideG V76 test-mode ride parity already applied");
}
