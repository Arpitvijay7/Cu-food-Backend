const express = require("express");
const passport = require("passport");

const { isAuthenticatedUser } = require("../middleware/auth");
const { googleLogout } = require("../utils/provider");

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
} = require("../controller/userController");

const router = express.Router();

router.route("/new").post(registerUser);

router.route("/login").post(loginUser);

router.get(
  "/googleAuth",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get(
  "/googlelogin",
  passport.authenticate("google", {
    scope: ["profile"],
    successRedirect: process.env.FRONTEND_URL,
  })
);

router.get('/googleLogout',isAuthenticatedUser,googleLogout);

router.route("/logout").get(isAuthenticatedUser, logoutUser);

router.route("/password/forget").post(isAuthenticatedUser, forgotPassword);

router.route("/password/reset/:token").put(isAuthenticatedUser, forgotPassword);

module.exports = router;
