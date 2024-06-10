const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/user/cartController');
const wishlistController = require('../../controllers/user/wishlistController');
const userAuth = require('../../Middleware/userAuthentication');
const serverError = require('../../Middleware/errorHandler');

/////////////////////////////get routes////////////////////

router.get('/getCart',userAuth.forceLogout,cartController.getCart,serverError.errorHandler);

router.get('/getCheckout',userAuth.forceLogout,cartController.getCheckout,serverError.errorHandler);

router.get('/getOrderHistory',userAuth.forceLogout,cartController.getOrderHistoryPage,serverError.errorHandler);

////////////////////post routes/////////////////////

router.post('/addToCart/:productId',cartController.addToCart,serverError.errorHandler);

router.post('/confirmOrder',cartController.confirmOrder,serverError.errorHandler);

router.post('/addToWishlist/:productId', wishlistController.addToWishlist,serverError.errorHandler);

//////////////////delete routes///////////////////////

router.delete('/removeFromCart/:productId',cartController.removeFromCart,serverError.errorHandler);

router.delete('/removeFromWishlist',wishlistController.removeFromWishlist,serverError.errorHandler);

router.delete('/cancelOrder',cartController.cancelOrder,serverError.errorHandler);

///////////////patch routes/////////////////

router.patch('/changeAddress',cartController.changeAddress,serverError.errorHandler);










module.exports = router;
