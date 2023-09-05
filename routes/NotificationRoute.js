const express = require('express');
const { registerToken, UnregisterToken } = require('../controller/notificationController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/registerToken/:token').get(isAuthenticatedUser, registerToken);

router.route('/UnregisterToken').get(isAuthenticatedUser, UnregisterToken);

module.exports = router;