const express = require("express");
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');
const { addToCart, removefromcart, getAllItemsFromCart, replaceFromCart, increaseQuantity, decreaseQuantity } = require("../controller/CartController");

const router = express.Router();

router.route('/getAllfromCart').get(isAuthenticatedUser, getAllItemsFromCart)

router.route('/addToCart/:id/:option').get(isAuthenticatedUser , addToCart)

router.route('/removeFromCart/:id').delete(isAuthenticatedUser , removefromcart)

router.route('/replaceFromCart/:id/:option').get(isAuthenticatedUser , replaceFromCart)

router.route('/increaseQuantity/:id').get(isAuthenticatedUser , increaseQuantity)

router.route('/decreaseQuantity/:id').get(isAuthenticatedUser , decreaseQuantity)

module.exports = router;