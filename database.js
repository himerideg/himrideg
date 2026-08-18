const dns = require("dns");
const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| DNS
|--------------------------------------------------------------------------
| MongoDB Atlas SRV lookup ko reliable banane ke liye.
|--------------------------------------------------------------------------
*/

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (
    !mongoUri ||
    mongoUri === "PASTE_YOUR_MONGODB_ATLAS_URI_HERE"
  ) {
    throw new Error(
      "MONGODB_URI missing hai. Server ki .env file me MongoDB URI add karo."
    );
  }

  mongoose.connection.on("connected", () => {
    console.log(
      "✅ MongoDB connection established"
    );
  });

  mongoose.connection.on("error", (error) => {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );
  });

  mongoose.connection.on("disconnected", () => {
    console.log(
      "⚠️ MongoDB disconnected"
    );
  });

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
};

/*
|--------------------------------------------------------------------------
| Disconnect Database
|--------------------------------------------------------------------------
*/

const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();

    console.log(
      "✅ MongoDB connection closed"
    );
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};