const Order = require("../models/Order");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const Shop = require("../models/Shop");
const Food = require("../models/Food");
const { sendPushNotification } = require("../utils/pushNotification");
const User = require("../models/userModel");
const newOrder = require("../utils/newOrderEmail");

// Create a new order
exports.checkout = catchAsyncError(async (req, res) => {
  const { productId, totalPrice } = req.body;
  
  const phoneNumber = req.user.phoneNo;

  const instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET,
  });

  const uniqueOrderReceipt = productId + phoneNumber;

  instance.orders.create(
    {
      amount: Number(totalPrice * 100), // amount in the smallest currency unit ,
      currency: "INR",
      receipt: uniqueOrderReceipt,
    }, // receipt id for the order (unique string))
    (err, order) => {
      if (!err) {
        res.json(order);
      } else {
        res.send(err);
      }
    }
  );
});

exports.verifyOrder = catchAsyncError(async (req, res) => {
  const { checkoutRes, orderId } = req.body;
  
  const phoneNumber = req.user.phoneNo;
  const hmac = crypto.createHmac("sha256", process.env.RAZOR_KEY_SECRET);

  hmac.update(orderId + "|" + checkoutRes.razorpay_payment_id);
  //HMAC-SHA256:- This is just a naming convention, HMAC-X means the X cryptographic
  //function has been used to calculate this hash
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature == checkoutRes.razorpay_signature) {
    //payment is successful, and response has been came from authentic source.
    const { deliveryCheckbox, address, paymentInfo } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return next(new ErrorHandler(`No such cart found`, 400));
    }
    if (!req.user) {
      return next(new ErrorHandler("Login first to place the order", 401));
    }
    let deliveryAddress = undefined;
    let Otp = undefined;
    if (deliveryCheckbox) {
      deliveryAddress = address;
    } else {
      const random = Math.floor(Math.random() * 1000000);
      Otp = random;
    }
    let fooditmes = cart.Food;

    let ShopItems = await Shop.findById(cart.shop);

    await sendPushNotification(
      ShopItems.vendor,
      "CU FOODZ",
      "You have a new order"
    );

    const user = await User.findById(req.user._id);

    const orderItems = {
      user: req.user._id,
      userName: user.name,
      paymentInfo,
      phoneNumber,
      delivery: deliveryCheckbox,
      deliveryAddress,
      deliveryType: ShopItems.roomDelivery ? "Room" : "Normal",
      Otp,
      OrderItems: fooditmes,
      totalPrice: cart.totalSum,
      paidAt: Date.now(),
      shop: cart.shop,
      vendor: ShopItems.vendor,
    };

    const order = await Order.create(orderItems);
    ShopItems.Balance = ShopItems.Balance + cart.totalSum;
    ShopItems.TotalEarnings = ShopItems.TotalEarnings + cart.totalSum;
    ShopItems.TodaysEarnings = ShopItems.TodaysEarnings + cart.totalSum;

    ShopItems.TodayAcceptedOrder.push(order._id);
    await ShopItems.save();

    await newOrder({
      date: order.createdAt,
      totalPrice: cart.totalSum,
      phoneNo: 7737308877,
      shopName: cart.Food[0].shopName,
    });

    if (deliveryCheckbox) {
      return res.status(200).json({
        success: true,
        order,
        phoneNumber,
      });
    } else {
      return res.status(200).json({
        success: true,
        order,
        Otp,
        phoneNumber,
      });
    }
  } else {
    res.json({ success: false, message: "Payment Failed" });
  }
});

exports.orderViaCash = catchAsyncError(async (req, res,next) => {
  const { deliveryCheckbox, address, paymentInfo } = req.body;
  if (!req.user) {
    return next(new ErrorHandler("Login first to place the order", 401));
  }
  
  const cart = await Cart.findOne({ userId: req.user._id });
  
  if (req.user.isPhoneVerified === false) {
    return next(new ErrorHandler("Please verify your phone number", 401));
  }

  if (!cart) {
    return next(new ErrorHandler(`No such cart found`, 400));
  }
  
  const orders = await Order.find({
    user: req.user._id,
    orderStatus: { $in: ["Placed", "Preparing"] },
  });

  if (orders.length >= 2) {
    return next(
      new ErrorHandler("Only 2 orders at a time", 401)
    );
  }

  let deliveryAddress = undefined;
  let Otp = undefined;
  if (deliveryCheckbox) {
    deliveryAddress = address;
  } else {
    const random = Math.floor(Math.random() * 1000000);
    Otp = random;
  }
  let fooditmes = cart.Food;

  let ShopItems = await Shop.findById(cart.shop);

  await sendPushNotification(
    ShopItems.vendor,
    "CU FOODZ",
    "You have a new order"
  );

  const user = await User.findById(req.user._id);

  const orderItems = {
    user: req.user._id,
    userName: user.name,
    paymentInfo,
    phoneNumber : req.user.phoneNo,
    delivery: deliveryCheckbox,
    deliveryAddress,
    Otp,
    OrderItems: fooditmes,
    totalPrice: cart.totalSum + cart.deliveryPrice,
    deliveryType: ShopItems.roomDelivery ? "Room" : "Normal",
    paidAt: Date.now(),
    shop: cart.shop,
    vendor: ShopItems.vendor,
  };

  const order = await Order.create(orderItems);
  ShopItems.Balance = ShopItems.Balance + cart.totalSum;
  ShopItems.TotalEarnings = ShopItems.TotalEarnings + cart.totalSum;
  ShopItems.TodaysEarnings = ShopItems.TodaysEarnings + cart.totalSum;

  ShopItems.TodayAcceptedOrder.push(order._id);
  await ShopItems.save();

  await newOrder({
    date: order.createdAt,
    totalPrice: cart.totalSum,
    phoneNo: req.user.phoneNo,
    shopName: cart.Food[0].shopName,
  });

  if (deliveryCheckbox) {
    return res.status(200).json({
      success: true,
      order,
    });
  } else {
    return res.status(200).json({
      success: true,
      order,
      Otp,
    });
  }
});

// get logged in user  Orders
exports.myOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    orderStatus: { $in: ["Placed", "Preparing"] },
  });
  orders.reverse();
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.myDeliveredOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    orderStatus: "Delivered",
  });
  orders.reverse();
  res.status(200).json({
    success: true,
    orders,
  });
});

// get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  orders.reverse();

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrderStatus = catchAsyncError(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderStatus = req.body.status;

  await order.save();

  res.status(200).json({
    success: true,
  });
});

// get all Orders -- Admin
exports.getNewOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({
    orderStatus: "Placed",
    vendor: req.user._id,
  });

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  orders.reverse();

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//get All Active Orders -- Admin
exports.getAllActiveOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({
    orderStatus: "Preparing",
    vendor: req.user._id,
  });

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  orders.reverse();

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//get All Active Orders -- Admin
exports.getAllDelieveredOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({
    orderStatus: "Delivered",
    vendor: req.user._id,
  });

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  orders.reverse();

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// delete Order -- Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

// Get Order by otp -- Admin --vendor
exports.getOrderByOtp = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findOne({ Otp: id, vendor: req.user._id });

  if (!order || order.orderStatus === "Delivered") {
    return next(new ErrorHandler("No Order found with this otp", 400));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//Order Response from vendor -- Admin --vendor
exports.orderResponse = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const type = req.query.type;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHandler("No Order found", 400));
  }

  if (type) {
    order.orderStatus = type;

    await order.save();
  }

  const neworders = await Order.find({
    orderStatus: "Placed",
    vendor: req.user._id,
  });

  res.status(200).json({
    success: true,
    neworders,
  });
});
