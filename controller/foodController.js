const Food = require('../models/Food')
const Shop = require("../models/Shop");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/ErrorHandler");

// adding a food item to menu   --Admin
exports.addFoodItem = catchAsyncError(async (req ,res,next) => {
   req.body.shop = req.params.id;

   const food = await Food.create(req.body);
   
   if (!food) {
    return next(new ErrorHandler(`Please enter all details for creating a new food item`,404))
   }
   
   const shop = await Shop.findById(req.params.id);

   if (!shop) {
    return next(new ErrorHandler(`No such shop found`,404))
   }
   
   shop.menu.push(food._id)
   await shop.save()

   res.status(200).json({
    message : 'food added successfully in shop',
    food,
    shop
   })

})

// Remove a food item from the menu of the shop
exports.deleteFoodItem = catchAsyncError(async(req, res, next) => {
    let food = await Food.findById(req.params.id);
    if (!food) {
        return next(new ErrorHandler(`No such food found to delete`,404))
    }

    let shop = await Shop.findById(req.params.id1);
    
    if (!shop) {
        return next(new ErrorHandler(`No such shop found`,404))
    }

    const index = shop.menu.indexOf(req.params.id);
    if (index > -1) {
        shop.menu.splice(index, 1); 
    }
    
    await shop.save();
    res.status(200).json({
        message : 'food deleted successfully',
        food,
    })
})

// Update a food info
exports.updateFood = catchAsyncError(async(req , res , next) => {
    let food = await Food.findById(req.params.id);
    
    if (!food) {
       return next(new ErrorHandler('food Item not found' , 404))
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        message : 'food updated successfully in menu',
        food
    })
})

