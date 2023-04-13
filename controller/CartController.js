const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const ErrorHandler = require("../utils/ErrorHandler");

// Get All items of a Cart
exports.getAllItemsFromCart = catchAsyncError(async(req , res , next)=> {
    
   const cart = await Cart.findOne({userId: req.user._id});

    if (!cart) {
        return next(new ErrorHandler(`No such cart found`,400));
    }

    let food = [];

    for (let i = 0; i < cart.Food.length; i++) {
        let cartfood = await Food.findById(cart.Food[i])
        food.push(cartfood);
    }

    res.status(200).json({
        message: `Your Cart Items`,
        food
    })
})
// Adding a Food item to a shop
exports.addToCart = catchAsyncError(async(req , res , next) => {
   const id = req.params.id;

   const food = await Food.findById(id);
   const cart = await Cart.findOne({userId: req.user._id});

   if (!food) {
    return next(new ErrorHandler(`No such food found to add in cart`,400));
   }

   if (!cart) {
    return next(new ErrorHandler(`No such cart found`,400));
   }

   for (let i = 0; i < cart.Food.length; i++) {
     let cartFood = await Food.findById(cart.Food[i]);

     if (!cartFood.shop.equals(food.shop)) {
        return next(new ErrorHandler(`You Already have a item in cart from diffrent shop remove them to add this item`,400))
     }
   }

   cart.Food.push(food);
   cart.totalSum += food.price;

   await cart.save()

   res.status(200).json({
    message : `Item Successfully added in Cart`,
    food
   })
})

// Remove a Food Item from a shop
exports.removefromcart = catchAsyncError(async (req,res,next)=> {
    const foodId = req.params.id;
 
    const food = await Food.findById(foodId);
 
    if (!food) return next(new ErrorHandler("Their is no Such food to remove from Cart",401))
    
    const userCart = await Cart.findOne({userId: req.user})
 
    if (!userCart) return next(new ErrorHandler("No cart found",404));
    
    for(let i = 0 ; i < userCart.Food.length ;i++) {
       
        if (userCart.Food[i] == foodId) {
            console.log(userCart.Food);
            userCart.Food.splice(i,1);
            break;
        }
    }
 
 
    userCart.totalSum -= food.price;
    
    if (userCart.totalSum < 0) userCart.totalSum = 0;

    await userCart.save();

    res.status(200).json({
     success: true,
     message:`Product removed from cart Successfully`
    })
})

// Replace from Cart
exports.replaceFromCart = catchAsyncError(async (req , res , next)=> {
    
    const cart = await Cart.findOne({userId : req.user._id});

    if (!cart) {
        return next(new ErrorHandler(`No such cart found`,400));
    }
    const food = await Food.findById(req.params.id);
    
    if (!food) {
        return next(new ErrorHandler(`No such food found to add in cart`,400));
    }
    
    cart.Food = [];
    cart.totalSum = 0;

    cart.Food.push(food._id);
    cart.totalSum += food.price;
    
    await cart.save();
    res.status(200).json({
        message : `Items replaced in cart Sucessfully`,
        cart
    })
})


