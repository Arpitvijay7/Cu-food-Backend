const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
   totalSum : {
      type:Number,
      default: 0,
   },
   Food : [{
      type: mongoose.Schema.ObjectId,
      ref: "Food",
   }],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
})

module.exports = mongoose.model('Cart',CartSchema);
