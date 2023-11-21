const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../models/Shop");
const Food = require("../models/Food");
const UnverifiedShop = require("../models/UnverifiedShop");
const multer = require("multer");
const path = require("path");
const { dataUri, getdataUri } = require("../utils/dataUri");
const cloudinary = require("cloudinary");
const { log } = require("console");

// Create a shop
exports.createShop = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(
      new ErrorHandler(
        `UnSupported Type:-  Only jpeg jpg and png images are supported `,
        404
      )
    );
  }

  const fileuri = getdataUri(req.file);

  const myCloud = await cloudinary.v2.uploader.upload(fileuri.content);

  img_obj = {
    public_id: myCloud.public_id,
    path: myCloud.secure_url,
    contentType: req.file.mimetype,
  };

  req.body.image = img_obj;
  req.body.vendor = req.user._id;

  const shop = await UnverifiedShop.create(req.body);

  if (!shop) {
    return next(
      new ErrorHandler(`Please enter all information of your shop`, 404)
    );
  }
  res.status(201).json({
    message: `Shop created successfully`,
    shop,
  });
});

// Get All Shops --Admin
exports.getAllshops = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 10;
  const totalShops = await Shop.countDocuments();

  const apiFeatures = new ApiFeatures(Shop.find({}), req.query)
    .search()

  let shops = await apiFeatures.query;

  res.status(201).json({
    success: true,
    shops,
    totalShops,
    resultPerPage: resultPerPage,
  });
});

// Delete a Shop --Admin
exports.deleteShop = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const shop = await Shop.findById(id);

  if (!shop) {
    return next(new ErrorHandler(`No Such Shop found`, 404));
  }

  await Shop.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: "Shop Deleted successfully",
  });
});

// Get a Shop Detail
exports.getShopDetail = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const shop = await Shop.findById(id);

  if (!shop) {
    return next(new ErrorHandler(`No Such Shop found`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Shop Found successfully",
    shop,
  });
});

// Update a Shop Detail --Admin
exports.updateShop = catchAsyncError(async (req, res, next) => {
  let shop = Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    shop,
  });
});

// Get Menu
exports.getMenu = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const resultPerPage = 9;
  let page = req.query.page || 1;
  const shop = await Shop.findById(id);

  if (!shop) {
    return next(new ErrorHandler("No such shop found to get menu from", 404));
  }

  let Menu = [];

  for (let i = 0; i < shop.menu.length; i++) {
    const apiFeatures = new ApiFeatures(
      Food.find({}),
      req.query,
      shop.menu[i]
    ).menuSearch();

    const item = await apiFeatures.query;

    if (item[0] !== undefined) {
      Menu.push(item[0]);
    }
  }
  let startIndex = (page - 1) * resultPerPage;
  let endIndex = page * resultPerPage;
  
  res.status(200).json({
    message: "Success",
    shopName: shop.name,
    Menu : Menu.slice(startIndex, endIndex),
    MenuLength: shop.menu.length,
  });
});

// Get Vendor Shop --Admin --Vendor
exports.getVendorShop = catchAsyncError(async (req, res, next) => {
  const id = req.user._id;

  const shop = await Shop.findOne({ vendor: id });

  if (!shop) {
    return next(
      new ErrorHandler(
        `No shop found related to your account please register your shop first`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    shop,
  });
});

exports.changeShopStatus = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const shop = await Shop.findById(id);

  if (!shop) {
    return next(new ErrorHandler("No such shop found to get menu from", 404));
  }

  if (shop.status == "open") {
    shop.status = "closed";
  } else {
    const date = new Date();
    const time = date.getHours() + ":" + date.getMinutes();

    if (
      (time > shop.closeAt && time > shop.openAt) ||
      (time < shop.openAt && time < shop.closeAt)
    ) {
      return next(
        new ErrorHandler("You can't Open your Shop at this time", 401)
      );
    }

    shop.status = "open";
  }

  await shop.save();

  res.status(200).json({
    message: "Success",
    shop,
  });
});

exports.verifyShop = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  let Unveriedshop = await UnverifiedShop.findOne({ vendor: id });

  if (!Unveriedshop) {
    return next(new ErrorHandler("No such shop found to verify", 404));
  }
  let shopItem = {
    image: Unveriedshop.image,
    rating: Unveriedshop.rating,
    name: Unveriedshop.name,
    description: Unveriedshop.description,
    menu: Unveriedshop.menu,
    roomDelivery: Unveriedshop.roomDelivery,
    DeliveryLocation: Unveriedshop.DeliveryLocation,
    vendor: Unveriedshop.vendor,
    status: Unveriedshop.status,
    openAt: Unveriedshop.openAt,
    closeAt: Unveriedshop.closeAt,
    TotalEarnings: Unveriedshop.TotalEarnings,
    TodaysEarnings: Unveriedshop.TodaysEarnings,
    Balance: Unveriedshop.Balance,
    TodayAcceptedOrder: Unveriedshop.TodayAcceptedOrder,
    TodayRejectedOrder: Unveriedshop.TodayRejectedOrder,
    tags:Unveriedshop.tags,
    minDeliveryOrder: Unveriedshop.minDeliveryOrder,
    createdAt: Unveriedshop.createdAt,
  };
  await Unveriedshop.deleteOne();

  const shop = await Shop.create(shopItem);

  res.status(200).json({
    message: "Success",
    shop,
  });
});

exports.searchByCuisine = catchAsyncError(async (req, res, next) => {

  const apiFeatures = new ApiFeatures(Shop.find({}), req.query)
    .searchByCuisine();

  const shops = await apiFeatures.query;

  res.status(200).json({
    success: true,
    shops,
  });
});