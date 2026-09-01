const dns = require("dns");
const mongoose = require("mongoose");

const {
  mongo: mongoScalability
} = require("./scalability");

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
    serverSelectionTimeoutMS: 10000,

    // ADD-ONLY scalability foundation. Existing URI/database remains same.
    maxPoolSize:
      mongoScalability.maxPoolSize,

    minPoolSize:
      mongoScalability.minPoolSize,

    maxIdleTimeMS:
      mongoScalability.maxIdleTimeMS,

    socketTimeoutMS:
      mongoScalability.socketTimeoutMS,

    connectTimeoutMS:
      mongoScalability.connectTimeoutMS,

    heartbeatFrequencyMS:
      mongoScalability.heartbeatFrequencyMS,

    retryWrites: true
  });

  console.log(
    `🗄️ MongoDB pool ready: min ${mongoScalability.minPoolSize}, max ${mongoScalability.maxPoolSize}`
  );

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