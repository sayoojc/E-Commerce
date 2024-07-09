const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/user/walletController');
const serverError = require('../../Middleware/errorHandler');
const userAuthentication = require('../../Middleware/userAuthentication');

router.get('/getWallet',userAuthentication.forceLogout,walletController.getWallet);

module.exports = router;