
const express = require('express');
const adminController=require("../../controllers/admin/adminCtrl");
const adminAuth = require('../../Middleware/adminAuth');



const router = express.Router();

///////Get Controlls///////

router.get("/adminLogin",adminController.getAdminLogin);
router.get("/Dashboard",adminAuth.adminAuth,adminController.getAdminDashboard);



//////Post Controlls/////

router.post("/adminLogin",adminController.postAdminLogin);
router.post("/postAdminLogout",adminController.postAdminLogout);



module.exports = router;