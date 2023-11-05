const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const sendToken = require("../utils/JwtToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Shop = require("../models/Shop");
const Razorpay = require("razorpay");

// Register a new user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  let { email, password } = req.body;

  const role = req.query.role;

  console.log(email, password);
  if (!email || !password) {
    return next(
      new ErrorHandler(`Please enter email and password to register`, 400)
    );
  }
  console.log(role);
  if (role === "vendor") {
    vendor_account_details = {};
    vendor_account_details.accountNumber = req.body.accountNumber;
    vendor_account_details.accountHolderName = req.body.accountHolderName;
    vendor_account_details.bankName = req.body.bankName;
    vendor_account_details.ifscCode = req.body.ifscCode;

    req.body = {
      name: req.body.vendorName,
      email: req.body.email,
      password: req.body.password,
      vendor_account_details,
    };
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create(req.body);
  }

  if (role === "vendor") {
    user.role = "vendor";
    await user.save();
  }

  const verificationtoken = await user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  let verifyEmailUrl;
  if (process.env.NODE_ENV === "production") {
    verifyEmailUrl = `https://cufoodz.com/verifyEmail?token=${verificationtoken}`;
  } else {
    verifyEmailUrl = `${req.protocol}://localhost:3000/verifyEmail?token=${verificationtoken}`;
  }

  if (role === "vendor") {
    if (process.env.NODE_ENV === "production") {
      verifyEmailUrl = `https://cufoodz.com/vendor/verifyEmail?token=${verificationtoken}`;
    } else {
      verifyEmailUrl = `${req.protocol}://localhost:3000/vendor/verifyEmail?token=${verificationtoken}`;
      console.log(verifyEmailUrl);
    }
  }

  try {
    await sendEmail({
      type: "VERIFY_EMAIL",
      email: user.email,
      name: user.name,
      verifyEmailUrl,
      req,
      subject: `Cu Food Email Verification`,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.EmailVerificationToken = undefined;
    user.EmailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

exports.verifyEmail = catchAsyncError(async (req, res, next) => {
  const EmailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({ EmailVerificationToken });

  console.log(user);
  if (!user) {
    return next(
      new ErrorHandler(`Verification Link either invalid or expired`, 400)
    );
  }

  if (user.isVerified === true) {
    return next(new ErrorHandler(`Email already verified`, 400));
  }

  if (user.EmailVerificationExpire < Date.now()) {
    user.EmailVerificationToken = undefined;
    user.EmailVerificationExpire = undefined;
    return next(new ErrorHandler(`Verification Link expired`, 400));
  }

  user.isVerified = true;
  user.EmailVerificationToken = undefined;
  user.EmailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  let cart;

  cart = Cart.create({
    userId: user._id,
  });

  if (!cart) {
    console.log("cart error");
    return next(new ErrorHandler(`Cart not created`, 400));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  let { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return next(
      new ErrorHandler(`Please enter email and password to login`, 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler(`Please enter a valid email or password`, 401)
    );
  }
  console.log(user);
  const isPasswordMatched = await user.comparePassword(password);
  console.log(isPasswordMatched);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(user, 200, res);
});

// Remove User --Admin
exports.removeUser = catchAsyncError(async (req, res, next) => {
  if (req.user._id == req.params.id) {
    return next(new ErrorHandler(`You can't delete your own account`, 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`No user found`, 404));
  }

  if (user.role === "admin") {
    return next(
      new ErrorHandler(`You are authorized to delete other admin accounts`, 400)
    );
  }

  await User.findByIdAndDelete(req.params.id);
  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "User removed successfully",
    users,
  });
});

// Make User Admin --Admin
exports.makeUserAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`No user found`, 404));
  }
  if (user.role === "admin") {
    return next(new ErrorHandler(`User is already an admin`, 400));
  }

  user.role = "admin";

  await user.save();

  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "User is now an admin",
    users,
  });
});
//Get All Users ---Admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new ErrorHandler(`No users found`, 404));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

// Logout User
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.cookie("connect.sid", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

//Get Logged In User
exports.getLoggedInUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler(`No user found`, 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user.googleId) {
    return next(
      new ErrorHandler(
        `You logged in via google login we can't change your password`,
        400
      )
    );
  }

  if (!user) {
    return next(new ErrorHandler("No User with this email found", 404));
  }

  // Get ResetPassword Token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  
  let resetPasswordUrl;
  if (process.env.NODE_ENV === "production") {
     resetPasswordUrl = `https://cufoodz.com/resetpassword?token=${resetToken}`;
  } else {
     resetPasswordUrl = `${req.protocol}://localhost:3000/resetpassword?token=${resetToken}`;
  }

  try {
    await sendEmail({
      type: "RESET_PASSWORD",
      email: user.email,
      name: user.name,
      resetPasswordUrl,
      req,
      subject: `Cu Food Password Recovery`,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // creating token hash

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password does not match with confirm password", 400)
    );
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (user.resetPasswordExpire < Date.now()) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Vendor Withdrwal Request --vendor only
exports.vendorWithdrawalRequest = catchAsyncError(async (req, res, next) => {
  const vendor = await User.findById(req.user._id);

  if (!vendor) {
    return next(new ErrorHandler(`No vendor found`, 404));
  }

  if (vendor.role !== "vendor") {
    return next(new ErrorHandler(`You are not a vendor`, 400));
  }

  const recipientAccountNumber = vendor.vendor_account_details.accountNumber;
  const recipientBankCode = vendor.vendor_account_details.ifscCode;
  const recipientName = vendor.vendor_account_details.accountHolderName;

  if (!recipientAccountNumber || !recipientBankCode || !recipientName) {
    return next(
      new ErrorHandler(
        `Please provide all the required fields for withdrawal`,
        400
      )
    );
  }

  const shop = await Shop.findOne({ vendor: req.user._id });

  const amount = shop.Balance;

  if (amount == 0) {
    return next(new ErrorHandler(`You have no balance to withdraw`, 400));
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET,
  });

  const withdrawalOptions = {
    transfers: [
      {
        account: recipientAccountNumber,
        amount: amount * 100, // Amount should be in paise
        currency: "INR",
        notes: {
          recipient_name: recipientName,
        },
      },
    ],
  };

  razorpay.transfers.create(withdrawalOptions, (error, transfer) => {
    if (error) {
      console.error("Withdrawal error:", error);
      res.status(400).json({
        message: "Withdrawal request failed",
        error,
      });
    } else {
      console.log("Withdrawal successful:", transfer);
      res.status(200).json({
        message: "Withdrawal request initiated successfully",
        transfer,
      });
    }
  });

  // const withdrawalRequest = await razorpay.virtualAccounts.create({
  //   receiver_type: "Bank of Baroda",
  //   receiver_details: {
  //     account_number: recipientAccountNumber,
  //     name: recipientName,
  //     // Add more recipient details as needed
  //   },
  //   amount,
  //   description: "Withdrawal from Cu Food",
  // });
  // console.log('afteramount',amount);

  // if (withdrawalRequest && withdrawalRequest.id) {
  //   // If the withdrawal request was successful
  //   res.status(200).json({
  //     message: "Withdrawal request initiated successfully",
  //     data: withdrawalRequest,
  //   });
  // } else {
  //   // If the withdrawal request failed
  //   res.status(500).json({ error: "Withdrawal request failed" });
  // }
});
