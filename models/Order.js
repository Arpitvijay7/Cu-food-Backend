const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
  },

  phoneNumber: {
    type: Number,
    required: true,
    minlength: 10,
    maxlength: 10,
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

  deliveryType: {
    type: String,
    default: "Normal",
  },

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
      shopName: {
        type: String,
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
      review: {
        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },
      },
    },
  ],
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
  },
  totalPrice: Number,
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  paidAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Placed",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
