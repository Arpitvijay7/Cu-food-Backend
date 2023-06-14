const express = require('express');
const { checkout } = require('../controller/orderController');
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route('/checkout',).post(isAuthenticatedUser ,checkout);

module.exports = router;