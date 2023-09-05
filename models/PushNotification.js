const mongoose = require("mongoose");

const pushNotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    fcm_token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
});

module.exports = mongoose.model("PushNotification", pushNotificationSchema);