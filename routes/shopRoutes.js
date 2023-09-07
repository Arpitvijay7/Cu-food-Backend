const express = require("express");
const {
  getAllshops,
  createShop,
  deleteShop,
  getShopDetail,
  updateShop,
  getMenu,
  getVendorShop,
  changeShopStatus,
} = require("../controller/shopController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");

const router = express.Router();

router.route("/getAllShops").get(getAllshops);

router.route("/getMenu/:id").get(getMenu);

router
  .route("/createShop")
  .post(
    isAuthenticatedUser,
    authorizedRoles("admin", "vendor"),
    singleUpload,
    createShop
  );

router
  .route("/deleteShop/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteShop);

router.route("/getShopDetail/:id").get(getShopDetail);

router
  .route("/updateShop/:id")
  .post(isAuthenticatedUser, authorizedRoles("admin"), updateShop);

router
  .route("/getShop")
  .get(isAuthenticatedUser, authorizedRoles("admin", "vendor"), getVendorShop);

router
  .route("/changeStatus/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin", "vendor"), changeShopStatus);

  router
  .route("/changeStatus/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin", "vendor"), changeShopStatus);

module.exports = router;
