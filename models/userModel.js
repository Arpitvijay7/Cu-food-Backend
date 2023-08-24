const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email."],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password ."],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    googleId : {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    phoneNo: {
      type: String,
      maxLength: [10, "Phone Number cannot exceed 10 characters"],
      minLength: [10, "Phone Number should have 10 characters"],   
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre('save', async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    let salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
})

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    let result = await bcrypt.compare(enteredPassword, this.password);
    return result;
};

// Generating JWT Token
userSchema.methods.getJWTToken = function() {
  let token = jwt.sign(
    {
      id : this._id
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  )
  return token;
}

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

module.exports = mongoose.model("User", userSchema);
