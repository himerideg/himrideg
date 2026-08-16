require("dotenv").config();

const { connectDatabase } = require("./src/config/database");
const Admin = require("./src/models/Admin");

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`${name} environment variable required hai`);
  }
  return value;
}

async function createAdmin() {
  try {
    await connectDatabase();

    const email = requiredEnv("ADMIN_EMAIL").toLowerCase();
    const password = requiredEnv("ADMIN_BOOTSTRAP_PASSWORD");

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

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: "HimRideG Admin",
      email,
      password
    });

    console.log("==================================");
    console.log("✅ Admin Created Successfully");
    console.log("Email:", admin.email);
    console.log("Password is stored only in environment — not printed.");
    console.log("==================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin bootstrap failed:", error.message);
    process.exit(1);
  }
}

createAdmin();
