const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true , "Please enter your shop name"],
        trim : true
    },
    description: {
        type: String,
        required: [true, "Please enter Shop Despriction"],
    },
    image: 
    {
        path:String,
        contentType:String,
    },
    menu : [{
       type: mongoose.Schema.ObjectId,
       ref: "Food",
    }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Shop', shopSchema);