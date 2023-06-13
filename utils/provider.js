const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const catchAsyncError = require("../middleware/catchAsyncError");
const Cart = require("../models/Cart");
dotenv.config({ path: "./config/config.env" });

exports.connectPassport = catchAsyncError(() => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        const user = await User.findOne({
          googleId: profile.id,
        });

        if (!user) {
          const newUser = await User.create({
            name: profile.displayName,
            email: "googleLogin@gmail.com",
            password: "undefined",
            googleId: profile.id,
          });

          console.log(profile.id);
          await newUser.save();

          return done(null, newUser);
        } else {
          done(null, user);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    const cart = Cart.create({
      userId: user._id,
    });

    if (!cart) {
      return next(new ErrorHandler(`Cart not created`, 400));
    }
    done(null, user);
  });
});

exports.googleLogout = catchAsyncError((req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie("connect.sid");

    res.status(200).json({
      message: `User Logged out successfully`,
    });
  });
});
