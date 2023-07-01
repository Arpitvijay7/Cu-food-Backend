const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  // let  {token}  = req.headers;
  let {token}  = req.cookies;
  let googleToken = req.cookies["connect.sid"];

  if (!token && !googleToken) {
    return next(
      new ErrorHandler(`You have to login to access this resource`, 400)
    );
  }

  if (token) {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);
  }
  
  next();
});

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access the resource`,
          403
        )
      );
    }
    next();
  };
};
