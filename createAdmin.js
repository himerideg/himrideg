require("dotenv").config();

const mongoose = require("mongoose");

const { connectDatabase } = require("./src/config/database");
const Admin = require("./src/models/Admin");

async function createAdmin() {
  try {
    await connectDatabase();

    const existingAdmin = await Admin.findOne({
      email: "admin@himrideg.com"
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const admin = await Admin.create({
      name: "HimRideG Admin",
      email: "admin@himrideg.com",
      password: "HimRideG@123"
    });

    console.log("==================================");
    console.log("✅ Admin Created Successfully");
    console.log("Email :", admin.email);
    console.log("Password : HimRideG@123");
    console.log("==================================");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

createAdmin();