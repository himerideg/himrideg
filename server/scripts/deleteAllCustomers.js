require("dotenv").config();

const {
  connectDatabase,
  disconnectDatabase
} = require("../src/config/database");

const User = require(
  "../src/models/User"
);

/*
|--------------------------------------------------------------------------
| ONE-TIME CUSTOMER ACCOUNT PURGE
|--------------------------------------------------------------------------
|
| This script deletes ONLY User documents where role === "customer".
| Driver and Admin accounts are untouched.
| Ride / Booking history is intentionally NOT deleted by this script.
|
| Safety gate:
| CONFIRM_DELETE_ALL_CUSTOMERS=YES_DELETE_ALL_CUSTOMERS
|
*/

const REQUIRED_CONFIRMATION =
  "YES_DELETE_ALL_CUSTOMERS";

const run = async () => {
  const confirmation =
    String(
      process.env
        .CONFIRM_DELETE_ALL_CUSTOMERS ||
        ""
    ).trim();

  if (
    confirmation !==
    REQUIRED_CONFIRMATION
  ) {
    console.error("");
    console.error(
      "❌ Customer purge blocked."
    );
    console.error(
      "CONFIRM_DELETE_ALL_CUSTOMERS=YES_DELETE_ALL_CUSTOMERS set karke dobara run karo."
    );
    console.error("");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDatabase();

    const beforeCount =
      await User.countDocuments({
        role: "customer"
      });

    console.log("");
    console.log(
      `🧹 Existing customer accounts found: ${beforeCount}`
    );

    if (beforeCount === 0) {
      console.log(
        "✅ Delete karne ke liye koi customer account nahi mila."
      );
      return;
    }

    const result =
      await User.deleteMany({
        role: "customer"
      });

    const afterCount =
      await User.countDocuments({
        role: "customer"
      });

    console.log(
      `✅ Deleted customer accounts: ${result.deletedCount || 0}`
    );
    console.log(
      `✅ Remaining customer accounts: ${afterCount}`
    );
    console.log(
      "ℹ️ Driver/Admin accounts aur Ride/Booking records delete nahi kiye gaye."
    );
    console.log("");
  } finally {
    await disconnectDatabase();
  }
};

run()
  .catch((error) => {
    console.error("");
    console.error(
      "❌ Customer purge failed:"
    );
    console.error(
      error?.stack ||
      error?.message ||
      error
    );
    console.error("");
    process.exitCode = 1;
  });
