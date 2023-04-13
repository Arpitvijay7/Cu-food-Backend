const express = require('express');
const {getAllshops, createShop ,deleteShop,getShopDetail , updateShop, getMenu} = require('../controller/shopController');
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/getAllShops').get(getAllshops)

router.route('/getMenu/:id').get(getMenu)

router.route('/createShop').post(isAuthenticatedUser,authorizedRoles('admin'),createShop)

router.route('/deleteShop/:id').delete(isAuthenticatedUser,authorizedRoles('admin'),deleteShop)

router.route('/getShopDetail/:id').get(getShopDetail)

router.route('/updateShop/:id').post(isAuthenticatedUser,authorizedRoles('admin'),updateShop)

module.exports = router;

