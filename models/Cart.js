const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
   totalSum : {
      type:Number,
      default: 0,
   },
   deliveryPrice : {
      type:Number,
      default: 20,
   },
   freeDeliveryUpto: {
      type:Number,
      default: 200,
   },
   Food : [{
      name: {
         type:String
      },
      shopName: {
         type:String
      },
      price : {
         type:Number
      },
      Option :{
         type: String,
      },
      image : {
         path : String
      },
      quantity : {
         type:Number,
         default: 1,
      },
      foodId :{
         type : mongoose.Schema.ObjectId,
         ref : "Food"
      }
   }],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    isEmpty : {
      type:Boolean,
      default: true,
    },
    
    shop : {
      type: mongoose.Schema.ObjectId,
      ref : "Shop",
    }
})

module.exports = mongoose.model('Cart',CartSchema);
