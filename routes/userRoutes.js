const express = require("express");
const passport = require("passport");

const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const { googleLogout } = require("../utils/provider");

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  getAllUsers,
  getLoggedInUser,
  removeUser,
  makeUserAdmin,
  vendorWithdrawalRequest,
  resetPassword,
  verifyEmail,
  remove,
  createCart,
} = require("../controller/userController");
const {Loginlimiter, SignUplimiter,forgotPasswordlimiter} = require("../middleware/ratelimiter");

const router = express.Router();

router.route("/new").post(SignUplimiter, registerUser);

router.route("/login").post(Loginlimiter, loginUser);

router.route("/logedInUser").get(isAuthenticatedUser, getLoggedInUser);

router
  .route("/remove/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), removeUser);

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

router
  .route("/getAllUsers")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllUsers);

router
  .route("/makeUserAdmin/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin"), makeUserAdmin);

router.get("/googleLogout", isAuthenticatedUser, googleLogout);

router.route("/logout").get(isAuthenticatedUser, logoutUser);

router.route("/password/forgot").post(forgotPasswordlimiter, forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/verify/:token").put(verifyEmail);

router
  .route("/vendorWithdrwal")
  .get(
    isAuthenticatedUser,
    authorizedRoles("vendor", "admin"),
    vendorWithdrawalRequest
  );

module.exports = router;
