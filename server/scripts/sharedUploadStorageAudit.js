/*
|--------------------------------------------------------------------------
| HimRideG Shared Upload Storage Audit — Phase 6
|--------------------------------------------------------------------------
| Read-only validation. No file, database record or GridFS object is changed.
*/

const path = require("node:path");
const fs = require("node:fs");

const root = path.resolve(__dirname, "..", "..");
const servicePath = path.join(
  root,
  "server",
  "src",
  "services",
  "sharedUploadStorageService.js"
);
const renderPath = path.join(root, "render.yaml");

const serviceSource = fs.readFileSync(servicePath, "utf8");
const renderSource = fs.readFileSync(renderPath, "utf8");

const checks = [
  [
    "hybrid mode supported",
    serviceSource.includes('"hybrid-gridfs"')
  ],
  [
    "legacy persistent mode auto-promoted",
    serviceSource.includes('configured === "persistent-disk"') &&
      serviceSource.includes('return "hybrid-gridfs"')
  ],
  [
    "emergency opt-out available",
    serviceSource.includes("UPLOAD_STORAGE_SHARED_DISABLED")
  ],
  [
    "GridFS bucket implementation present",
    serviceSource.includes("GridFSBucket")
  ],
  [
    "Render hybrid mode configured",
    renderSource.includes("UPLOAD_STORAGE_MODE") &&
      renderSource.includes("hybrid-gridfs")
  ],
  [
    "Render shared-storage opt-out disabled",
    renderSource.includes("UPLOAD_STORAGE_SHARED_DISABLED") &&
      renderSource.includes('value: "false"')
  ]
];

let failed = 0;

for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failed += 1;
}

console.log(`Shared upload audit: ${checks.length - failed}/${checks.length} PASS`);

if (failed) {
  process.exitCode = 1;
}
