const catchAsyncError = require("../middleware/catchAsyncError");
const PushNotification = require("../models/PushNotification");
const { sendPushNotification } = require("../utils/pushNotification");

exports.registerToken = catchAsyncError(async (req, res, next) => {
  const token = req.params.token;
  const user = req.user._id;

  const UserPermissions = await PushNotification.findOne({
    user,
    fcm_token: token,
  });

  if (UserPermissions) {
    console.log("Hello");
    res.status(200).json({
      success: true,
      message: "Token already registered",
    });
    // sendPushNotification(user, "Aldrady", "Welcome to Cu Food");

    return;
  }

  const pushNotification = await PushNotification.create({
    user,
    fcm_token: token,
  });

  if (!pushNotification) {
    return next(new ErrorHandler("Something went wrong", 500));
  }

  // sendPushNotification(user, "Cu", "Welcome to Cu Food");
  // console.log("Push Notification:- " + pushNotification);
  console.log("dcdcsdcs");

  res.status(200).json({
    success: true,
    pushNotification,
  });
});

exports.UnregisterToken = catchAsyncError(async (req, res, next) => {
  const pushNotification = await PushNotification.deleteMany({
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    pushNotification,
  });
});
