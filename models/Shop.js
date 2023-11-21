const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your shop name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter Shop Despriction"],
  },
  image: {
    path: String,
    public_id: String,
    contentType: String,
  },
  menu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Food",
    },
  ],
  cuisinesOffered: {
    type: [String],
    default: [],
  },
  minDeliveryOrder: {
    type: Number,
    default: 200,
  },
  tags: {
    type: String,
    required: [true, "Please enter tags"],
  },
  deliveryPrice: {
    type: Number,
    default: 20,
  },
  roomDelivery: {
    type: Boolean,
    default: false,
  },
  DeliveryLocation: [
    {
      type: String,
    },
  ],
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    default: "closed",
  },
  openAt: {
    type: String,
    default: "09:00",
  },
  closeAt: {
    type: String,
    default: "21:00",
  },
  rating: {
    numofReviews: {
      type: Number,
      default: 0,
    },
    TotalRating: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
  },
  TotalEarnings: {
    type: Number,
    default: 0,
  },
  TodaysEarnings: {
    type: Number,
    default: 0,
  },
  Balance: {
    type: Number,
    default: 0,
  },
  TodayAcceptedOrder: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  ],
  TodayRejectedOrder: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Shop", shopSchema);
