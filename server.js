const Admin = require("../models/Admin");

/*
|--------------------------------------------------------------------------
| Environment Helpers
|--------------------------------------------------------------------------
*/

function cleanEnv(name) {
  return String(process.env[name] || "").trim();
}

function envFlag(name) {
  const value = cleanEnv(name).toLowerCase();

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(value);
}

function validateBootstrapPassword(password) {
  if (!password) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD environment variable required hai"
    );
  }

  if (password.length < 16) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD minimum 16 characters ka hona chahiye"
    );
  }

  if (/change|password|himrideg@123/i.test(password)) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD placeholder/default nahi ho sakta"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Admin Bootstrap / Safe Reset
|--------------------------------------------------------------------------
|
| Behaviour:
|
| 1. ADMIN_EMAIL missing ho to server ko crash nahi karta; warning deta hai.
| 2. Admin missing ho to ADMIN_BOOTSTRAP_PASSWORD se create karta hai.
| 3. Admin already exists ho to normally password ko bilkul touch nahi karta.
| 4. Sirf ADMIN_RESET_ON_START=true hone par existing admin ka password reset
|    karta hai.
| 5. Admin model ka pre-save hook password ko bcrypt hash karta hai, isliye
|    plaintext password database me save nahi hota.
|
| IMPORTANT:
| Reset successful hone ke turant baad Render Environment se
| ADMIN_RESET_ON_START ko false/remove kar dena chahiye.
|
*/

async function syncAdminBootstrap() {
  const email = cleanEnv("ADMIN_EMAIL").toLowerCase();
  const password = cleanEnv("ADMIN_BOOTSTRAP_PASSWORD");
  const shouldReset = envFlag("ADMIN_RESET_ON_START");

  if (!email) {
    console.warn(
      "⚠️ ADMIN_EMAIL missing hai. Admin bootstrap skip kiya gaya."
    );

    return {
      action: "skipped",
      reason: "ADMIN_EMAIL_MISSING"
    };
  }

  const admin = await Admin.findOne({
    email
  });

  /*
  |--------------------------------------------------------------------------
  | Existing Admin — Normal Startup
  |--------------------------------------------------------------------------
  */

  if (admin && !shouldReset) {
    console.log(
      `✅ Admin account ready: ${email}`
    );

    return {
      action: "unchanged",
      adminId: String(admin._id),
      email
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Create / Reset requires a valid bootstrap password
  |--------------------------------------------------------------------------
  */

  validateBootstrapPassword(password);

  /*
  |--------------------------------------------------------------------------
  | Existing Admin — Explicit One-Time Reset
  |--------------------------------------------------------------------------
  */

  if (admin && shouldReset) {
    admin.password = password;

    if (!admin.name) {
      admin.name = "HimRideG Admin";
    }

    admin.role = "admin";

    await admin.save();

    console.log(
      "========================================"
    );
    console.log(
      "✅ ADMIN PASSWORD RESET SUCCESSFUL"
    );
    console.log(
      `📧 Admin: ${email}`
    );
    console.log(
      "🔐 Password bcrypt hash ke saath database me update hua."
    );
    console.log(
      "⚠️ SECURITY: Ab ADMIN_RESET_ON_START ko false/remove karo."
    );
    console.log(
      "========================================"
    );

    return {
      action: "reset",
      adminId: String(admin._id),
      email
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Admin Missing — Create Safely
  |--------------------------------------------------------------------------
  */

  const createdAdmin = await Admin.create({
    name: "HimRideG Admin",
    email,
    password,
    role: "admin"
  });

  console.log(
    "========================================"
  );
  console.log(
    "✅ ADMIN CREATED SUCCESSFULLY"
  );
  console.log(
    `📧 Admin: ${email}`
  );
  console.log(
    "🔐 Password bcrypt hash ke saath database me save hua."
  );
  console.log(
    "========================================"
  );

  return {
    action: "created",
    adminId: String(createdAdmin._id),
    email
  };
}

module.exports = {
  syncAdminBootstrap
};
