const User = require("../models/User");
const {
  cleanToken
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
