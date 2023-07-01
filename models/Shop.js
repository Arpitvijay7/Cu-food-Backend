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

    status: {
        type: String,
        default: "closed",
    },
    openAt: {
        type: String,
        default: "9:00",
    },
    closeAt: {
        type: String,
        default: "21:00",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Shop', shopSchema);