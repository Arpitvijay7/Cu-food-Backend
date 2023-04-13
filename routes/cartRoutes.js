const Cart = require("../models/Cart");
const express = require("express");
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');
const { addToCart, removefromcart, getAllItemsFromCart, replaceFromCart } = require("../controller/CartController");

const router = express.Router();

router.route('/getAllfromCart').get(isAuthenticatedUser, getAllItemsFromCart)

router.route('/addToCart/:id').get(isAuthenticatedUser , addToCart)

router.route('/removeFromCart/:id').delete(isAuthenticatedUser , removefromcart)

router.route('/replaceFromCart/:id').get(isAuthenticatedUser , replaceFromCart)

module.exports = router;