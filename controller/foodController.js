const Food = require("../models/Food");
const Shop = require("../models/Shop");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const cloudinary = require("cloudinary");
const { getdataUri } = require("../utils/dataUri");
const Order = require("../models/Order");

// adding a food item to menu   --Admin
exports.addFoodItem = catchAsyncError(async (req, res, next) => {
  if (req.body.DualOptions) {
    req.body.DualOptions = JSON.parse(req.body.DualOptions);
  }

  if (!req.file) {
    return next(
      console.log("Wroung image type"),
      new ErrorHandler(
        `UnSupported Type:-  Only jpeg jpg and png images are supported `,
        404
      )
    );
  }

  req.body.shop = req.params.id;

  const fileuri = getdataUri(req.file);

  const myCloud = await cloudinary.v2.uploader.upload(fileuri.content);

  img_obj = {
    public_id: myCloud.public_id,
    path: myCloud.secure_url,
    contentType: req.file.mimetype,
  };

  req.body.image = img_obj;

  if (req.body.DualOptions) {
    if (!("price_full" in req.body)) {
      return next(
        new ErrorHandler("Please provide a price of large item also", 404)
      );
    }
  }

  const food = await Food.create(req.body);

  if (!food) {
    return next(
      new ErrorHandler(
        `Please enter all details for creating a new food item`,
        404
      )
    );
  }

  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorHandler(`No such shop found`, 404));
  }

  shop.menu.push(food._id);
  await shop.save();

  res.status(200).json({
    message: "food added successfully in shop",
    food,
    shop,
  });
});

// Remove a food item from the menu of the shop
exports.deleteFoodItem = catchAsyncError(async (req, res, next) => {
  let food = await Food.findById(req.params.id);
  if (!food) {
    return next(new ErrorHandler(`No such food found to delete`, 404));
  }

  let shop = await Shop.findById(req.params.id1);

  if (!shop) {
    return next(new ErrorHandler(`No such shop found`, 404));
  }

  const index = shop.menu.indexOf(req.params.id);
  if (index > -1) {
    shop.menu.splice(index, 1);
  }

  await shop.save();
  res.status(200).json({
    message: "food deleted successfully",
    food,
  });
});

// Update a food info
exports.updateFood = catchAsyncError(async (req, res, next) => {
  let food = await Food.findById(req.params.id);

  if (!food) {
    return next(new ErrorHandler("food Item not found", 404));
  }

  if (req.file) {
    const fileuri = getdataUri(req.file);
    let myCloud, destroyedImg;

    if (fileuri) {
      myCloud = await cloudinary.v2.uploader.upload(fileuri.content);
      destroyedImg = await cloudinary.uploader.destroy(food.image.public_id);

      if (!destroyedImg) {
        return next(new ErrorHandler("Error in deleting image", 404));
      }
    }

    img_obj = {
      public_id: myCloud.public_id,
      path: myCloud.secure_url,
      contentType: req.file.mimetype,
    };

    req.body.image = img_obj;
  } else {
    req.body.image = food.image;
  }

  food = await Food.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    upsert: true,
  });

  res.status(200).json({
    message: "food updated successfully in menu",
    food,
  });
});

exports.rateFood = catchAsyncError(async (req, res, next) => {
  const foodId = req.params.food;
  const orderId = req.params.order;
  const option = req.query.option;
  const food = await Food.findById(foodId);
  const order = await Order.findById(orderId);
  const shop = await Shop.findById(food.shop);

  if (!food) {
    return next(new ErrorHandler("food Item not found", 400));
  }

  if (order.user.toString() != req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to rate", 400));
  }

  if (!order) {
    return next(new ErrorHandler("Order not found", 400));
  }

  if (order.orderStatus !== "Delivered") {
    return next(new ErrorHandler("Order not delivered yet", 400));
  }

  const rating = req.body.rating;

  const item = {
    user: req.user._id,
    rating,
  };

  let check = 0;
  for (let i = 0; i < order.OrderItems.length; i++) {
    if (
      order.OrderItems[i].foodId.toString() == foodId.toString() &&
      (option ? order.OrderItems[i].Option == option : true)
    ) {
      order.OrderItems[i].review = item;
      await order.save();
      check = 1;
      break;
    }
  }

  if (check == 0) {
    return next(new ErrorHandler("Food not found in order", 400));
  }

  const newFoodRating = (
    (food.rating.TotalRating + parseInt(rating)) /
    (food.rating.numofReviews + 1)
  ).toFixed(1);

  food.rating.avgRating = newFoodRating;
  food.rating.TotalRating = food.rating.TotalRating + parseInt(rating);
  food.rating.numofReviews = food.rating.numofReviews + 1;
  await food.save();

  const newShopRating = (
    (shop.rating.TotalRating + parseInt(rating)) /
    (shop.rating.numofReviews + 1)
  ).toFixed(1);
  shop.rating.avgRating = newShopRating;
  shop.rating.TotalRating = shop.rating.TotalRating + parseInt(rating);
  shop.rating.numofReviews = shop.rating.numofReviews + 1;
  await shop.save();

  food.reviews.push(item);
  await food.save();

  res.status(200).json({
    message: "food rated successfully",
    food,
  });
});

exports.updateStocks = catchAsyncError(async (req, res, next) => {
  const foodId = req.params.id;
  const option = req.query.option;

  const food = await Food.findById(foodId);

  if (!food) {
    return next(new ErrorHandler("food Item not found", 400));
  }

  const shop = await Shop.findById(food.shop);

  if (!shop) {
    return next(new ErrorHandler("Shop not found", 400));
  }

  if (shop.vendor.toString() != req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to do this", 400));
  }

  if (option == "StockOut") {
    food.stockAvailability = false;
  }else if (option == "StockIn") {
    food.stockAvailability = true;
  }

  await food.save();

  res.status(200).json({
    message: "food stock out successfully",
    food,
  });
});
