const express = require('express');
const { registerUser, loginUser, logoutUser, forgotPassword } = require('../controller/userController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/new').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').get(isAuthenticatedUser ,logoutUser);

router.route('/password/forget').post(isAuthenticatedUser , forgotPassword)

router.route('/password/reset/:token').put(isAuthenticatedUser , forgotPassword)

module.exports = router;