const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/user/wishlistController');
const serverError = require('../../Middleware/errorHandler');
const userAuthentication = require('../../Middleware/userAuthentication');

router.get('/getWishlist',userAuthentication.forceLogout,wishlistController.getWishlist);

router.post('/addToWishlist/:productId', wishlistController.addToWishlist);

router.delete('/removeFromWishlist',wishlistController.removeFromWishlist);

router.put('/incProdNum',wishlistController.increaseProductNo);


module.exports = router;