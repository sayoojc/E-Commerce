const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/admin/couponController');
const adminAuth = require('../../Middleware/adminAuth');

router.get('/getAdminCoupons',adminAuth.adminAuth,couponController.getCoupon);
router.post('/addCoupon',couponController.addCoupon);
router.put('/editCoupon',couponController.editCoupon);


module.exports = router;