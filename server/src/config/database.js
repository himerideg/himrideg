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

  /*
  |--------------------------------------------------------------------------
  | Opt-in Historical Reference Preservation — NON-DESTRUCTIVE
  |--------------------------------------------------------------------------
  | Deleted/legacy users ki purani booking references ko delete ya invent nahi
  | karte. Original ids + financial ride state ko separate archive collection
  | me preserve kiya jata hai. Existing Booking documents untouched rehte hain.
  |--------------------------------------------------------------------------
  */

  if (
    String(process.env.BOOKING_REFERENCE_PRESERVE_ON_START || "")
      .trim()
      .toLowerCase() === "true"
  ) {
    try {
      const {
        preserveOrphanBookingReferences
      } = require(
        "../services/bookingReferencePreservationService"
      );

      await preserveOrphanBookingReferences();
    } catch (preservationError) {
      console.error(
        "⚠️ Booking reference preservation failed:",
        preservationError?.message || preservationError
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Opt-in Active Orphan Repair — UNPAID ONLY
  |--------------------------------------------------------------------------
  | Historical copy preserve hone ke baad sirf non-terminal + unpaid orphan
  | rides ko system-cancel kiya ja sakta hai. Paid/refunded ride kabhi is path
  | se mutate nahi hoti. Isse deleted legacy account ki stale request live
  | driver feed/negotiation me atki nahi rahegi.
  |--------------------------------------------------------------------------
  */

  if (
    String(process.env.ACTIVE_ORPHAN_REPAIR_ON_START || "")
      .trim()
      .toLowerCase() === "true"
  ) {
    try {
      const {
        repairActiveUnpaidOrphanRides
      } = require(
        "../services/activeOrphanRideRepairService"
      );

      await repairActiveUnpaidOrphanRides();

      // Archive ko repaired final state se sync rakho.
      if (
        String(process.env.BOOKING_REFERENCE_PRESERVE_ON_START || "")
          .trim()
          .toLowerCase() === "true"
      ) {
        const {
          preserveOrphanBookingReferences
        } = require(
          "../services/bookingReferencePreservationService"
        );

        await preserveOrphanBookingReferences();
      }
    } catch (repairError) {
      console.error(
        "⚠️ Active orphan repair failed:",
        repairError?.message || repairError
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Opt-in Live Atlas Integrity Audit — READ ONLY
  |--------------------------------------------------------------------------
  | Direct Atlas connector available na ho tab bhi Render ke existing secure
  | MONGODB_URI connection ke through same live database ko read-only audit
  | kiya ja sakta hai. Koi credential ya customer PII log nahi hoti.
  |
  | V73 audit v2 active wallet transaction model, encrypted payout-secret
  | storage, multiple-primary checks, legacy plaintext payout data, orphan
  | references aur ride concurrency sab ko count karta hai.
  |--------------------------------------------------------------------------
  */

  if (
    String(process.env.DB_INTEGRITY_AUDIT_ON_START || "")
      .trim()
      .toLowerCase() === "true"
  ) {
    try {
      const {
        runDatabaseIntegrityAuditV2
      } = require(
        "../services/databaseIntegrityAuditV2"
      );

      await runDatabaseIntegrityAuditV2();
    } catch (auditError) {
      console.error(
        "⚠️ DB integrity audit failed:",
        auditError?.message || auditError
      );
    }
  }

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
