require("dotenv").config();

const mongoose = require("mongoose");

const { connectDatabase } = require("./src/config/database");
const Admin = require("./src/models/Admin");

async function createAdmin() {
  try {
    await connectDatabase();

    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "");
    const adminName = String(process.env.ADMIN_NAME || "HimRideG Admin").trim();

    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set in server environment");
    }

    const existingAdmin = await Admin.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword
    });

    console.log("==================================");
    console.log("✅ Admin Created Successfully");
    console.log("Email :", admin.email);
    console.log("Password : [hidden]");
    console.log("==================================");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

createAdmin();