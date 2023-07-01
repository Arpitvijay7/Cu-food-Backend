const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const sendToken = require("../utils/JwtToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Register a new user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler(`Please enter email and password to register`, 400)
    );
  }

  const user = await User.create(req.body);

  const cart = Cart.create({
    userId: user._id,
  });

  if (!cart) {
    return next(new ErrorHandler(`Cart not created`, 400));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  let { email, password } = req.body;

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

  const isPasswordMatched = await user.comparePassword(password);

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
  console.log(user);
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

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  // res.status(200).json({
  //   success: true,
  //   message: `Email sent to ${user.email} successfully`,
  //   resetPasswordUrl,
  // });
  try {
    await sendEmail({
      email: user.email,
      subject: `Cu Food Password Recovery`,
      message,
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

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
