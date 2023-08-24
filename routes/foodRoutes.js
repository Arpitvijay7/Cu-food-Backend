const express = require("express");
const {
  addFoodItem,
  deleteFoodItem,
  updateFood,
} = require("../controller/foodController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");

const router = express.Router();

router
  .route("/addFoodItem/:id")
  .post(
    isAuthenticatedUser,
    authorizedRoles("admin","vendor"),
    singleUpload,
    addFoodItem
  );

router
  .route("/deleteFromMenu/:id/:id1")
  .delete(isAuthenticatedUser, authorizedRoles("admin","vendor"), deleteFoodItem);

router
  .route("/updateFood/:id")
  .post(isAuthenticatedUser, authorizedRoles("admin","vendor"),singleUpload, updateFood);

module.exports = router;
