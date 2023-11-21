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
        const user = await User.findOne({
          googleId: profile.id,
        });
        console.log(profile);
        let newUser;
        if (!user) {
          newUser = await User.create({
            name: profile.displayName,
            email: `Google@${profile.id}.com`,
            password: "undefined",
            googleId: profile.id,
            isVerified: true,
            avatar: profile.photos[0].value,
          });

          await newUser.save();

          const newCart = await Cart.create({
            userId: newUser._id,
          });

          await newCart.save();

          return done(null, newUser);
        } else {
          done(null, user);
        }
      }
    )
  );

});

// exports.googleLogout = catchAsyncError((req, res, next) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return next(err);
//     }

//     res.clearCookie("connect.sid");

//     res.status(200).json({
//       message: `User Logged out successfully`,
//     });
//   });
// });
