const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  phoneNo : {
    type: Number,
    max: [9999999999, "Phone Number cannot exceed 10 digits"],
    min: [1000000000, "Phone Number should have 10 digits"],    
    default: 1000000000
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  avatar : String,
  email: {
    type: String,
    required: [true, "Please Enter Your Email."],
    unique: [true, "This Email is already registered"],
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password ."],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  vendor_account_details: {
    accountNumber: {
      type: Number,
    },
    accountHolderName: {
      type: String,
    },
    bankName: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  Otp: String,
  OtpExpire: Date,

  EmailVerificationToken: String,
  EmailVerificationExpire: Date,

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  let salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  let result = await bcrypt.compare(enteredPassword, this.password);
  return result;
};

// Generating JWT Token
userSchema.methods.getJWTToken = function () {
  let token = jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
  return token;
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = async function () {
  // Generating Password Reset Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// Generating Otp 
userSchema.methods.getOtp = async function () {
  // Generating Password Reset Token
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Hashing and adding resetPasswordToken to userSchema
  let salt = await bcrypt.genSalt();
  this.Otp = await bcrypt.hash(otp.toString(),salt);

  this.OtpExpire = Date.now() + 5 * 60 * 1000;
  return otp;
}

// Compare Otp
userSchema.methods.compareOtp = async function (otp) {
  let result = await bcrypt.compare(otp, this.Otp);
  return result;
};

// Generating Password Reset Token
userSchema.methods.getEmailVerificationToken = async function () {
  // Generating Password Reset Token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.EmailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.EmailVerificationExpire = Date.now() + 30 * 60 * 1000;

  return verificationToken;
};

module.exports = mongoose.model("User", userSchema);
