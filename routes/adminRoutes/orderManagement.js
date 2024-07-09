const express = require('express');
const router = express.Router();
const orderManagementController = require('../../controllers/admin/orderManagementCntrl');


router.get('/getOrderManagement',orderManagementController.getOrderManagenent);
router.post('/updateOrderStatus', orderManagementController.updateOrderStatus);


module.exports = router;