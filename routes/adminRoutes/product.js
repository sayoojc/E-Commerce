const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const adminAuth = require('../../Middleware/adminAuth');
const multer = require('../../Middleware/productMulter');

//////get methods//////

router.get("/getProducts",adminAuth.adminAuth,productController.getProducts);
router.get("/getAddProducts",adminAuth.adminAuth,productController.getAddProducts);
router.get("/getEditProducts/:productId",adminAuth.adminAuth,productController.getEditProducts);

/////post methods/////

router.post("/postProducts",multer.postProducts,productController.postProducts);
router.post("/postEditProducts/:productId",multer.postEditProducts,productController.postEditProducts);
router.post("/postblockUnblockProduct",productController.postblockUnblockProduct);




module.exports = router;