const express = require("express");
const userController = require("../../controllers/user/userCtrl");
const router = express.Router();
const nocache = require('nocache');
const auth = require("../../Middleware/userAuthentication");
const userAuthentication = require('../../Middleware/userAuthentication');
const googleAuth = require('../../Middleware/googleAuth');

//get routes//
router.use(nocache());

router.get("/",userController.getHome);//////////////////////////////////////Get home before login/////////////////////

router.get("/getSignup/:referralCode", userController.getSignup);//////////////////////////Get the signup page///////////////////////

router.get("/getLogin", userController.getLogin);////////////////////////////Get the Login page////////////////////////

router.get("/getOtp",userController.getOtp); ////////////////////////////////Get the Otp page//////////////////////////

router.get('/getHome',userAuthentication.forceLogout,
  userController.getHomeAfterLogin);/////////////////////////////////////////Get the home after Login//////////////////

router.get('/getProductDetail/:productId',userAuthentication.forceLogout,
  userController.getProductDetail);//////////////////////////////////////////Get the product detail page///////////////

router.get("/product-list/:action",userAuthentication.forceLogout,
  userController.getProductList);////////////////////////////////////////////Get the product listing page with fiters//

router.get('/auth/google', googleAuth.authStageOne);   //////////////////////Google OAuth routes///////////////////////

router.get('/auth/google/redirect', googleAuth.authStageTwo);//  ////////////Google OAuth routes///////////////////////

router.get('/forgotPassword',userController.forgotPassword);////////////////Get the forgot password form//////////////

router.get('/getForgotPassOtpPage',userController.forgotPasswordOtpPage);

/////////////////post routes////////////////////

router.post('/postForgotPassword',userController.postForgotPassword);///////Post forgot password/////////////////////

router.post('/changePassOtp',userController.ChangePasswordOtp);

router.put('/ConfirmNewPass',userController.putForgotPassword);

router.post("/postLogin",userController.postLogin);

router.post("/postSignup",userController.postSignup);

router.post("/postOtp",userController.postOtp);

router.post("/postLogout",userController.postLogout);

router.post("/resendOtp",userController.resendOtp);

module.exports = router;


