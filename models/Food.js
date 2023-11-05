const mongoose = require("mongoose");

const foodSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter Food Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter Food Despriction"],
  },
  DualOptions: {
    type: Boolean,
    default: false,
  },
  price_half: {
    type: Number,
    required: [true, "Please enter Food Price"],
    maxLenght: [8, "Price cannot exceed 8 characters"],
  },
  stockAvailability: {
    type: Boolean,
    default: true,
  },
  price_full: {
    type: Number,
    maxLenght: [8, "Price cannot exceed 8 characters"],
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: [
      true,
      "Please enter in which shop you want to enter this food item",
    ],
  },
  image: {
    path: String,
    public_id: String,
    contentType: String,
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
  category: {
    type: String,
    required: [true, "please enter a Food category"],
  },
  discount: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comments: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Food", foodSchema);
