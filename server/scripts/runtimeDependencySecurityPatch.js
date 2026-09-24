const { spawnSync } = require("node:child_process");

/*
|--------------------------------------------------------------------------
| Runtime Dependency Security Patch
|--------------------------------------------------------------------------
| Render production build `npm ci` se lockfile-faithful install karta hai.
| Current lockfile me recently-disclosed advisories wali 3 packages pinned
| hain. Existing app code ko touch kiye bina patched runtime versions install
| karte hain. `--no-save --package-lock=false --ignore-scripts` repository
| files ko build ke dauran mutate nahi karta aur recursive lifecycle scripts
| ko bhi rokta hai.
|
| Canonical package.json/lock update future lock refresh me ki ja sakti hai;
| production runtime is script ke fail hone par build fail karega, insecure
| versions ke saath silently launch nahi hoga.
|--------------------------------------------------------------------------
*/

const patchedPackages = [
  "morgan@1.12.0",
  "multer@2.3.0",
  "qs@6.16.0"
];

const install = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  [
    "install",
    "--no-save",
    "--package-lock=false",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    ...patchedPackages
  ],
  {
    stdio: "inherit",
    env: process.env
  }
);

if (install.status !== 0) {
  console.error(
    `❌ Runtime security patch install failed (exit ${install.status})`
  );
  process.exit(install.status || 1);
}

const requiredVersions = {
  morgan: "1.12.0",
  multer: "2.3.0",
  qs: "6.16.0"
};

for (const [name, expected] of Object.entries(requiredVersions)) {
  const installed = require(`${name}/package.json`).version;

  if (installed !== expected) {
    console.error(
      `❌ ${name} runtime version mismatch: expected ${expected}, got ${installed}`
    );
    process.exit(1);
  }

  console.log(`✅ Security patched runtime: ${name}@${installed}`);
}

console.log("✅ Runtime dependency security patch complete");
