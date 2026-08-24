const User = require("../models/User");
const {
  cleanToken,
  sendPushToUser
} = require("../services/pushNotificationService");

exports.registerPushToken = async (req, res) => {
  try {
    const userId = String(
      req.user?._id ||
        req.user?.id ||
        ""
    );

    const token = cleanToken(
      req.body?.token
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Valid Expo push token required hai"
      });
    }

    await User.updateOne(
      {
        _id: userId
      },
      {
        $addToSet: {
          fcmTokens: token
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Push notification device registered"
    });
  } catch (error) {
    console.error(
      "Push token register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Push token register nahi hua"
    });
  }
};

exports.unregisterPushToken = async (req, res) => {
  try {
    const userId = String(
      req.user?._id ||
        req.user?.id ||
        ""
    );

    const token = cleanToken(
      req.body?.token
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (token) {
      await User.updateOne(
        {
          _id: userId
        },
        {
          $pull: {
            fcmTokens: token
          }
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Push notification device unregistered"
    });
  } catch (error) {
    console.error(
      "Push token unregister error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Push token unregister nahi hua"
    });
  }
};


exports.testPushNotification = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const result = await sendPushToUser(userId, {
      title: "HimRideG Notification Test 🔔",
      body: "Agar ye phone tray me aayi hai to push registration working hai.",
      data: { type: "notification_test", role: req.user?.role || "" }
    });

    return res.status(200).json({
      success: true,
      message: result?.sent ? "Test push sent" : "Registered push device nahi mila",
      data: result
    });
  } catch (error) {
    console.error("Test push error:", error);
    return res.status(500).json({ success: false, message: "Test push send nahi hui" });
  }
};
