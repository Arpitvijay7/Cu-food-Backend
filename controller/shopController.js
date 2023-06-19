const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../models/Shop");
const Food = require("../models/Food");
const multer = require("multer");
const path = require("path");

// multer diskStrorage
const Storage = multer.diskStorage({
  destination: "Uploads/shopImages",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random());
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        path.extname(file.originalname)
    );
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: Storage,
  fileFilter: filefilter,
}).single("image");

// Create a shop
exports.createShop = catchAsyncError(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new ErrorHandler(`UnSupported Type:-  Only jpeg jpg and png images are supported `,404));
    }

    img_obj = {
      path: path.join(
        __dirname,
        "..",
        "Uploads",
        "shopImages",
        req.file.filename
      ),
      contentType: req.file.mimetype,
    };

    req.body.image = img_obj;
    const shop = await Shop.create(req.body);

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
});

// Get All Shops --Admin
exports.getAllshops = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 10;
  const totalShops = await Shop.countDocuments();

  const apiFeatures = new ApiFeatures(Shop.find({}), req.query).search();

  const shops = await apiFeatures.query;

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
  console.log(shop);

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

// Update a Shop Detail
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

  const shop = await Shop.findById(id);

  if (!shop) {
    return next(new ErrorHandler("No such shop found to get menu from", 404));
  }

  let Menu = [];

  for (let i = 0; i < shop.menu.length; i++) {
    let item = await Food.findById(shop.menu[i]);
    Menu.push(item);
  }

  res.status(200).json({
    message: "Success",
    Menu,
  });
});
