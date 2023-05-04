const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter Food Name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "yy enter Food Despriction"],
    },
    price: {
        type: Number,
        required: [true, "Please enter Food Price"],
        maxLenght: [8, "Price cannot exceed 8 characters"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    shop : {
       type: mongoose.Schema.ObjectId,
       ref : 'Shop',
       required: [true, 'Please enter in which shop you want to enter this food item']
    },
    image:
    {
        path:String,
        contentType:String,
    },
    category: {
        type: String,
        required: [true, "please enter a Food category"],
    },
    discount: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
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
})

module.exports = mongoose.model('Food',foodSchema);