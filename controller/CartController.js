const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const ErrorHandler = require("../utils/ErrorHandler");

// Get All items of a Cart
exports.getAllItemsFromCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  res.status(200).json({
    message: `Your Cart Items`,
    cart: cart.Food,
  });
});

// Adding a Food item to a shop
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const option = req.params.option;

  const food = await Food.findById(id);
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!food) {
    return next(new ErrorHandler(`No such food found to add in cart`, 400));
  }

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  if (!cart.isEmpty && !cart.shop.equals(food.shop)) {
    return next(
      new ErrorHandler(
        `You Already have a item in cart from diffrent shop remove them to add this item`,
        400
      )
    );
  }

  if (!food.DualOptions && req.params.option == "full") {
    return next(
      new ErrorHandler(
        `Their is no option to choose large quautity in this meal`,
        404
      )
    );
  }

  if (food.DualOptions && food.price_full == 0) {
    return next(new ErrorHandler(`Internal Server Error`, 400));
  }

  let itemPrice = 0;

  if (option == "half") {
    itemPrice += food.price_half;
  } else {
    itemPrice += food.price_full;
  }

  cart.totalSum += itemPrice;

  if (cart.isEmpty) {
    cart.isEmpty = false;
    cart.shop = food.shop;
  }

  let foodItem = {
    name: food.name,
    price: itemPrice,
    Option: option,
    image: food.image.path,
    quantity: 1,
  };

  cart.Food.push(foodItem);
  await cart.save();

  res.status(200).json({
    message: `Item Successfully added in Cart`,
    Cart: cart,
  });
});

// Remove a Food Item from a shop
exports.removefromcart = catchAsyncError(async (req, res, next) => {
  const foodId = req.params.id;

  const userCart = await Cart.findOne({ userId: req.user });

  if (!userCart) return next(new ErrorHandler("No cart found", 404));

  let foodItem;
  let check = 1;
  for (let i = 0; i < userCart.Food.length; i++) {
    if (userCart.Food[i]._id == foodId) {
      foodItem = userCart.Food[i];
      userCart.Food.splice(i, 1);
      check = 0;
      break;
    }
  }

  if (check) {
    return next(new ErrorHandler(`No product found in cart to remove`, 404));
  }

  await userCart.save();

  userCart.totalSum -= foodItem.price * foodItem.quantity;
  if (userCart.totalSum < 0) userCart.totalSum = 0;

  if (userCart.Food.length == 0) {
    userCart.isEmpty = true;
    userCart.shop = undefined;
  }

  await userCart.save();

  res.status(200).json({
    success: true,
    message: `Product removed from cart Successfully`,
    userCart,
  });
});

// Replace from Cart
exports.replaceFromCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const option = req.params.option;

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }
  const food = await Food.findById(req.params.id);

  if (!food) {
    return next(new ErrorHandler(`No such food found to add in cart`, 400));
  }

  if (!food.DualOptions && req.params.option == "full") {
    return next(
      new ErrorHandler(
        `Their is no option to choose large quautity in this meal`,
        404
      )
    );
  }

  if (food.DualOptions && food.price_large === 0) {
    return next(new ErrorHandler(`Internal Server Error`, 400));
  }

  cart.Food = [];
  cart.totalSum = 0;

  let itemPrice = 0;

  if (option == "half") {
    itemPrice += food.price_half;
  } else {
    itemPrice += food.price_full;
  }

  cart.totalSum += itemPrice;

  let foodItem = {
    name: food.name,
    price: itemPrice,
    Option: option,
    image: food.image.path,
    quantity: 1,
  };

  cart.Food.push(foodItem);
  cart.shop = food.shop;

  await cart.save();
  res.status(200).json({
    message: `Items replaced in cart Sucessfully`,
    cart,
  });
});

exports.increaseQuantity = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const foodId = req.params.id;

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  let check = 1;
  for (let i = 0; i < cart.Food.length; i++) {
    if (cart.Food[i]._id == foodId) {
      cart.Food[i].quantity += 1;
      cart.totalSum +=  cart.Food[i].price;
      check = 0;
    }
  }
  
  if (check) {
    return next(new ErrorHandler(`No food item found of this type to increase quantity`,404))
  }

  await cart.save();
  
  res.json({
    message: `quantity increased successfully`,
    cart
  })
  
});

exports.decreaseQuantity = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const foodId = req.params.id;

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  let check = 1;
  for (let i = 0; i < cart.Food.length; i++) {
    if (cart.Food[i]._id == foodId) {
      cart.Food[i].quantity -= 1;
      cart.totalSum -=  cart.Food[i].price;
      check = 0;

      if (cart.Food[i].quantity == 0 ) {
        cart.Food.splice(i, 1);
      }

      if (cart.Food.length == 0) {
        cart.isEmpty = true;
        cart.shop = undefined;
      }
    }
  }
  
  if (check) {
    return next(new ErrorHandler(`No food item found of this type to decrease quantity`,404))
  }

  if (cart.totalSum < 0) cart.totalSum = 0;
  
  await cart.save();
  
  res.json({
    message: `quantity decreased successfully`,
    cart
  })
})