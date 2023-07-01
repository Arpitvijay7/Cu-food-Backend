const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  delivery: Boolean,

  deliveryAddress: {
    hostel: {
      type: String,
    },
    room: {
      type: Number,
    },
  },

  Otp: {
    type: Number,
  },

  OrderItems: [
    {
      name: {
        type: String,
      },
      price: {
        type: Number,
      },
      Option: {
        type: String,
      },
      image: {
        path: String,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      foodId: {
        type: mongoose.Schema.ObjectId,
        ref: "Food",
      },
    },
  ],
  shop : {
    type: mongoose.Schema.ObjectId,
    ref : "Shop",
  },
  totalPrice: Number,
  paidAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Preparing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
