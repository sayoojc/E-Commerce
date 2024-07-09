
const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/user/couponController');
const userAuth = require('../../Middleware/userAuthentication');

router.get('/getCoupons',userAuth.forceLogout,couponController.getCoupons);

router.post('/redeemCoupon',userAuth.forceLogout,couponController.redeemCoupon);


module.exports = router;