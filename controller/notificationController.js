const catchAsyncError = require("../middleware/catchAsyncError");
const PushNotification = require("../models/PushNotification");
const { sendPushNotification } = require("../utils/pushNotification");

exports.registerToken = catchAsyncError(async (req, res, next) => {
    const token = req.params.token;
    const user = req.user._id;

    const pushNotification = await PushNotification.create({
        user,
        fcm_token: token,
    });

    if (!pushNotification) {
        return next(new ErrorHandler("Something went wrong", 500));
    }
    
    // sendPushNotification(user,"Cu Food","Welcome to Cu Food");
    console.log("Push Notification:- " + pushNotification);

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
