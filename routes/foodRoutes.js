const express = require('express');
const { addFoodItem ,deleteFoodItem, updateFood} = require('../controller/foodController');
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/addFoodItem/:id').post(isAuthenticatedUser,authorizedRoles('admin'),addFoodItem)

router.route('/deleteFromMenu/:id/:id1').delete(isAuthenticatedUser,authorizedRoles('admin'),deleteFoodItem)

router.route('/updateFood/:id').post(isAuthenticatedUser,authorizedRoles('admin'),updateFood)

module.exports = router
