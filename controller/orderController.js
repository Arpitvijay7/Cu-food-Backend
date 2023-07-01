const Order = require("../models/Order");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");

// Create a new order
exports.checkout = catchAsyncError(async (req, res) => {
  const { productId, phoneNumber, totalPrice } = req.body;

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
    img_test =
      "https://images-gmi-pmc.edge-generalmills.com/320bc659-12a4-4199-a07f-15b746e29677.jpg";
    let fooditmes = cart.Food;
    
    const orderItems = {
      user: req.user._id,
      paymentInfo,
      delivery: deliveryCheckbox,
      deliveryAddress,
      Otp,
      OrderItems: fooditmes,
      totalPrice: cart.totalSum,
      paidAt: Date.now(),
      shop: cart.shop,
    };

    const order = await Order.create(orderItems);

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
  } else {
    res.json({ success: false, message: "Payment Failed" });
  }
});

//Making a new Order after payment
exports.newOrder = catchAsyncError(async (req, res) => {});

// get logged in user  Orders
exports.myOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

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
