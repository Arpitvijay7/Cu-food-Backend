const express = require("express");
const {
  checkout,
  verifyOrder,
  myOrders,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  getAllActiveOrders,
  getAllDelieveredOrders,
  getNewOrders,
  getOrderByOtp,
  orderResponse,
  myDeliveredOrders,
  orderViaCash,
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const {Orderlimiter} = require("../middleware/ratelimiter");


const router = express.Router();

router.route("/checkout").post(isAuthenticatedUser, checkout);

router.route("/verifyOrder").post(isAuthenticatedUser, verifyOrder);

router.route("/OrderviaCash").post(Orderlimiter,isAuthenticatedUser, orderViaCash);

router.route("/myOrders").get(isAuthenticatedUser, myOrders);

router.route("/myDeliveredOrders").get(isAuthenticatedUser, myDeliveredOrders);

router.route("/getOrder/:id").get(isAuthenticatedUser, getSingleOrder);

router
  .route("/remove/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

router
  .route("/allOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin", "vendor"), getAllOrders);

router
  .route("/getAllActiveOrders")
  .get(
    isAuthenticatedUser,
    authorizedRoles("admin", "vendor"),
    getAllActiveOrders
  );

router
  .route("/getNewOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin", "vendor"), getNewOrders);

router
  .route("/getNewOrders")
  .get(isAuthenticatedUser, authorizedRoles("admin", "vendor"), getNewOrders);

router
  .route("/getAllDelieveredOrders")
  .get(
    isAuthenticatedUser,
    authorizedRoles("admin", "vendor"),
    getAllDelieveredOrders
  );

router
  .route("/getOrderByOtp/:id")
  .get(isAuthenticatedUser, authorizedRoles("vendor", "admin"), getOrderByOtp);

router
  .route("/orderResponse/:id")
  .get(isAuthenticatedUser, authorizedRoles("vendor", "admin"), orderResponse);


module.exports = router;
