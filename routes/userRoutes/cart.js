const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/user/cartController');
const wishlistController = require('../../controllers/user/wishlistController');
const userAuth = require('../../Middleware/userAuthentication');
const serverError = require('../../Middleware/errorHandler');


/////////////////////////////get routes////////////////////

router.get('/getCart',userAuth.forceLogout,cartController.getCart);

router.get('/getCheckout',userAuth.forceLogout,cartController.getCheckout);

router.get('/getOrderHistory',userAuth.forceLogout,cartController.getOrderHistoryPage);

router.get('/getOrderDetail/:orderId',userAuth.forceLogout,cartController.getOrderDetailPage);

////////////////////post routes/////////////////////

router.post('/addToCart/:productId',cartController.addToCart);

router.post('/confirmOrder',cartController.confirmOrder);

router.post('/retryConfirmOrder',cartController.retryConfirmOrder);

router.post('/createRazorpayOrder', cartController.createRazorpayOrder);

// router.post('/confirmRazorpayOrder',cartController.confirmRazorpayOrder);

router.post('/failedRazorPayOrder',cartController.failedRazorPayOrder);


//////////////////delete routes///////////////////////

router.delete('/removeFromCart/:productId',cartController.removeFromCart);

router.delete('/cancelOrder',cartController.cancelOrder);

///////////////patch routes/////////////////

router.patch('/changeAddress',cartController.changeAddress);

////////download invooice////////////////////

router.get('/invoiceDownload/:orderId', cartController.getInvoiceDownload);

router.put('/incProdNumCart',cartController.increaseProductNo);



router.put('/returnProduct/:orderId/:productId',cartController.returnProduct);






module.exports = router;
