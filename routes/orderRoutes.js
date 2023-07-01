const express = require("express");
const {
  checkout,
  verifyOrder,
  myOrders,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  newOrder,
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/checkout").post(isAuthenticatedUser, checkout);

router.route("/verifyOrder").post(isAuthenticatedUser, verifyOrder);

router.route('/newOrder').post(isAuthenticatedUser , newOrder)

router.route("/myOrders").get(isAuthenticatedUser, myOrders);

router.route("/getOrder/:id").get(isAuthenticatedUser, getSingleOrder);

router
  .route("/remove/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

router
  .route("/allOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders);

module.exports = router;
