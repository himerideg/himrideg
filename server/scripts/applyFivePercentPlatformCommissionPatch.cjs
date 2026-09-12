const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const PLATFORM_COMMISSION_PERCENT = 5;
const DRIVER_SHARE_PERCENT = 100 - PLATFORM_COMMISSION_PERCENT;

function patchFile(relativePath, transforms) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    console.error(`[5% commission patch] Missing file: ${relativePath}`);
    process.exit(1);
  }

  let source = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const transform of transforms) {
    const { from, to, label, optional = false, all = false } = transform;

    if (source.includes(to) && !source.includes(from)) {
      continue;
    }

    if (!source.includes(from)) {
      if (optional) continue;
      console.error(`[5% commission patch] Anchor missing in ${relativePath}: ${label}`);
      process.exit(1);
    }

    source = all ? source.split(from).join(to) : source.replace(from, to);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, source, "utf8");
    console.log(`[5% commission patch] Updated ${relativePath}`);
  } else {
    console.log(`[5% commission patch] Already correct ${relativePath}`);
  }
}

patchFile("src/models/Booking.js", [
  {
    label: "booking commission default",
    from: "    platformCommissionPercent: {\n      type: Number,\n      default: 10,\n      min: 0,\n      max: 100\n    },",
    to: "    platformCommissionPercent: {\n      type: Number,\n      default: 5,\n      min: 0,\n      max: 100\n    },"
  }
]);

patchFile("src/models/User.js", [
  {
    label: "driver profile commission default",
    from: "      commissionPercentage: {\n        type: Number,\n        min: 0,\n        max: 100,\n        default: 10\n      }",
    to: "      commissionPercentage: {\n        type: Number,\n        min: 0,\n        max: 100,\n        default: 5\n      }"
  }
]);

patchFile("src/services/paymentSettlementService.js", [
  {
    label: "settlement commission fallback",
    from: "    booking?.platformCommissionPercent ?? 10",
    to: "    booking?.platformCommissionPercent ?? 5"
  }
]);

patchFile("src/services/walletService.js", [
  {
    label: "wallet commission constant",
    from: "const PLATFORM_COMMISSION_PERCENT = 10;",
    to: "const PLATFORM_COMMISSION_PERCENT = 5;"
  },
  {
    label: "wallet commission comment",
    from: "HimRideG commission exactly 10% hai.",
    to: "HimRideG commission exactly 5% hai.",
    optional: true
  },
  {
    label: "wallet rule response",
    from: "Customer paid final fare ka 10% HimRideG commission; 90% driver earnings wallet credit after ride completion",
    to: "Customer paid final fare ka 5% HimRideG commission; 95% driver earnings wallet credit after ride completion",
    optional: true
  }
]);

patchFile("src/controllers/paymentController.js", [
  {
    label: "payment controller commission constant",
    from: "const PLATFORM_COMMISSION_PERCENT = 10;",
    to: "const PLATFORM_COMMISSION_PERCENT = 5;"
  }
]);

patchFile("src/controllers/launchPaymentController.js", [
  {
    label: "launch payment commission constant",
    from: "const PLATFORM_COMMISSION_PERCENT = 10;",
    to: "const PLATFORM_COMMISSION_PERCENT = 5;"
  },
  {
    label: "launch payment commission description",
    from: "fixed platform commission 10% hai. Baki 90% driver ke internal earnings",
    to: "fixed platform commission 5% hai. Baki 95% driver ke internal earnings",
    optional: true
  }
]);

patchFile("src/controllers/fareController.js", [
  {
    label: "fare helper commission default",
    from: "  commissionPercent = 10\n)",
    to: "  commissionPercent = 5\n)"
  },
  {
    label: "fare acceptance commission fallback",
    from: ".platformCommissionPercent ||\n          10",
    to: ".platformCommissionPercent ||\n          5",
    all: true
  }
]);

patchFile("src/sockets/rideSocket.js", [
  {
    label: "socket fare lock commission fallback",
    from: "          const commissionPercent =\n            booking\n              .platformCommissionPercent ||\n            10;",
    to: "          const commissionPercent =\n            booking\n              .platformCommissionPercent ||\n            5;"
  }
]);

patchFile("src/controllers/directDriverPaymentController.js", [
  {
    label: "direct payment commission comment",
    from: "HimRideG only records 10% fee due.",
    to: "HimRideG only records 5% fee due.",
    optional: true
  }
]);

patchFile("src/controllers/platformFeeController.js", [
  {
    label: "platform fee status commission percent",
    from: "  return {\n    due,\n    threshold: PLATFORM_FEE_BLOCK_THRESHOLD,",
    to: `  return {\n    due,\n    commissionPercent: ${PLATFORM_COMMISSION_PERCENT},\n    driverSharePercent: ${DRIVER_SHARE_PERCENT},\n    threshold: PLATFORM_FEE_BLOCK_THRESHOLD,`
  }
]);

const validationTargets = [
  ["src/models/Booking.js", "default: 5"],
  ["src/models/User.js", "commissionPercentage"],
  ["src/services/paymentSettlementService.js", "platformCommissionPercent ?? 5"],
  ["src/services/walletService.js", "const PLATFORM_COMMISSION_PERCENT = 5;"],
  ["src/controllers/paymentController.js", "const PLATFORM_COMMISSION_PERCENT = 5;"],
  ["src/controllers/launchPaymentController.js", "const PLATFORM_COMMISSION_PERCENT = 5;"],
  ["src/controllers/fareController.js", "commissionPercent = 5"],
  ["src/sockets/rideSocket.js", "platformCommissionPercent ||\n            5"],
  ["src/controllers/platformFeeController.js", "commissionPercent: 5"]
];

for (const [relativePath, expected] of validationTargets) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (!source.includes(expected)) {
    console.error(`[5% commission patch] Validation failed: ${relativePath} missing ${expected}`);
    process.exit(1);
  }
}

console.log("[HimRideG Commission] Platform Fee = 5% | Driver Share = 95% | ₹100 due threshold unchanged");
