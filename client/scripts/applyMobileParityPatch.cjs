const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const jobs = [
  {
    target: path.join(root, "src", "pages", "DriverDashboard.jsx"),
    marker: "../driver-mobile-app-parity.css",
    patches: [
      "v72-driver-dashboard-part1.patch",
      "v72-driver-dashboard-part2.patch",
      "v72-driver-dashboard-part3.patch"
    ]
  },
  {
    target: path.join(root, "src", "pages", "CustomerDashboard.jsx"),
    marker: "../customer-mobile-app-parity.css",
    patches: [
      "v72-customer-dashboard-part1.patch",
      "v72-customer-dashboard-part2.patch",
      "v72-customer-dashboard-part3.patch"
    ]
  }
];

for (const job of jobs) {
  let current = "";
  try {
    current = fs.readFileSync(job.target, "utf8");
  } catch (error) {
    console.error("HimRideG V72 target file missing:", job.target);
    process.exit(1);
  }

  if (current.includes(job.marker)) {
    console.log("HimRideG V72 already applied:", path.relative(root, job.target));
    continue;
  }

  for (const patchName of job.patches) {
    const patchFile = path.join(root, "patches", patchName);
    if (!fs.existsSync(patchFile)) {
      console.error("HimRideG V72 patch file missing:", patchFile);
      process.exit(1);
    }

    const check = spawnSync("git", ["apply", "--check", patchFile], {
      cwd: root,
      stdio: "inherit",
      shell: false
    });

    if (check.status !== 0) {
      console.error("HimRideG V72 patch check failed:", patchName);
      process.exit(check.status || 1);
    }

    const apply = spawnSync("git", ["apply", patchFile], {
      cwd: root,
      stdio: "inherit",
      shell: false
    });

    if (apply.status !== 0) {
      console.error("HimRideG V72 patch apply failed:", patchName);
      process.exit(apply.status || 1);
    }
  }

  console.log("HimRideG V72 applied:", path.relative(root, job.target));
}
