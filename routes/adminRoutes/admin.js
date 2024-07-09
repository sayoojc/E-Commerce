
const express = require('express');
const adminController=require("../../controllers/admin/adminCtrl");
const adminAuth = require('../../Middleware/adminAuth');
const errorHandler = require('../../Middleware/errorHandler');


const router = express.Router();

///////Get Controlls///////

router.get("/adminLogin",adminController.getAdminLogin);
router.get("/Dashboard",adminAuth.adminAuth,adminController.getAdminDashboard);
// In your routes file, ensure you have a route for the AJAX call
router.get('/admin/top-products', adminController.getTopProducts);




//////Post Controlls/////

router.post("/adminLogin",adminController.postAdminLogin);
router.post("/postAdminLogout",adminController.postAdminLogout);



module.exports = router;