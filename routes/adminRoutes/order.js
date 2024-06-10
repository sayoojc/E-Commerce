const express = require ('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const adminAuth = require('../../Middleware/adminAuth');


router.get('/getAdminOrdersPage',adminAuth.adminAuth,orderController.getAdminOrdersPage);



module.exports = router;