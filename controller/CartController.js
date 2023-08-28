const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Shop = require("../models/Shop");
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
    totalSum: cart.totalSum,
  });
});

// Adding a Food item to a shop
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const option = req.params.option;

  const food = await Food.findById(id);
  const cart = await Cart.findOne({ userId: req.user._id });
  const shop = await Shop.findById(food.shop);

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
        200
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

  for (let i = 0; i < cart.Food.length; ++i) {
    if (cart.Food[i].foodId == id && option == cart.Food[i].Option) {
      cart.Food[i].quantity += 1;
      cart.totalSum += cart.Food[i].price;
      await cart.save();

      return res.status(200).json({
        message: `Item Successfully added in Cart`,
        Cart: cart,
        totalSum: cart.totalSum,
      });
    }
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
  await cart.save();

  let foodItem = {
    name: food.name,
    price: itemPrice,
    Option: option,
    image: {
      path: food.image.path,
    },
    quantity: 1,
    shopName: shop.name,
    foodId: food.id,
  };

  console.log(food.image.path);
  console.log(foodItem);

  cart.Food.push(foodItem);
  await cart.save();

  console.log("cart:- ", cart);

  res.status(200).json({
    message: `Item Successfully added in Cart`,
    Cart: cart,
    totalSum: cart.totalSum,
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
    if (userCart.Food[i].foodId == foodId) {
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
    totalSum: userCart.totalSum,
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
  const shop = await Shop.findById(food.shop);

  if (!food) {
    return next(new ErrorHandler(`No such food found to add in cart`, 400));
  }

  if (!food.DualOptions && req.params.option == "full") {
    return next(
      new ErrorHandler(
        `Their is no option to choose full quautity in this meal`,
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
    image: {
      path: food.image.path,
    },
    foodId: food.id,
    shopName: shop.name,
    quantity: 1,
  };

  cart.Food.push(foodItem);
  cart.shop = food.shop;

  await cart.save();
  res.status(200).json({
    message: `Items replaced in cart Sucessfully`,
    cart,
    totalSum: cart.totalSum,
  });
});

exports.increaseQuantity = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const FoodId = req.params.id;

  const { option } = req.query;

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  let check = 1;
  for (let i = 0; i < cart.Food.length; i++) {
    if (cart.Food[i].foodId == FoodId && cart.Food[i].Option == option) {
      cart.Food[i].quantity += 1;
      cart.totalSum += cart.Food[i].price;
      check = 0;
      break;
    }
  }

  if (check) {
    return next(
      new ErrorHandler(
        `No food item found of this type to increase quantity`,
        404
      )
    );
  }

  await cart.save();

  res.json({
    message: `quantity increased successfully`,
    cart,
    totalSum: cart.totalSum,
  });
});

exports.decreaseQuantity = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const FoodId = req.params.id;

  const { option } = req.query;

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }

  let check = 1;
  for (let i = 0; i < cart.Food.length; i++) {
    if (cart.Food[i].foodId == FoodId && cart.Food[i].Option == option) {
      cart.Food[i].quantity -= 1;
      cart.totalSum -= cart.Food[i].price;
      check = 0;

      if (cart.Food[i].quantity == 0) {
        cart.Food.splice(i, 1);
      }

      if (cart.Food.length == 0) {
        cart.isEmpty = true;
        cart.shop = undefined;
      }
    }
  }

  if (check) {
    return next(
      new ErrorHandler(
        `No food item found of this type to decrease quantity`,
        404
      )
    );
  }

  if (cart.totalSum < 0) cart.totalSum = 0;

  await cart.save();

  res.json({
    message: `quantity decreased successfully`,
    cart,
    totalSum: cart.totalSum,
  });
});
