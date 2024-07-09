const userController = require('../../controllers/admin/accountctrl');
const adminAuth = require('../../Middleware/adminAuth');
const errorHandler = require('../../Middleware/errorHandler');
const express = require('express');
const router = express.Router();


///////////////////get routes/////////////////


router.get("/getUserDetail",adminAuth.adminAuth,userController.getUserDetail);

///////////////////post block unblock///////////////
router.post("/postblockUnblockUser",userController.postblockUnblockUser);

module.exports = router;