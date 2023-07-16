const express = require("express");
const {
  checkout,
  verifyOrder,
  myOrders,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  newOrder,
  getAllActiveOrders,
  getAllDelieveredOrders
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/checkout").post(isAuthenticatedUser, checkout);

router.route("/verifyOrder").post(isAuthenticatedUser, verifyOrder);

router.route("/myOrders").get(isAuthenticatedUser, myOrders);

router.route("/getOrder/:id").get(isAuthenticatedUser, getSingleOrder);

router
  .route("/remove/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

router
  .route("/allOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders);

router
  .route("/getAllActiveOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllActiveOrders);


router
.route("/getAllDelieveredOrders")
.get(isAuthenticatedUser, authorizedRoles("admin"), getAllDelieveredOrders);

module.exports = router;
