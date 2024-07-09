const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryCtrl");
const adminAuth = require('../../Middleware/adminAuth');
const multerConfig = require('../../Middleware/multer');


///get Controll///

router.get("/getCategory",categoryController.getCategory);

///post controll///
router.post("/previewResizeAddCategory",multerConfig.previewResizeAddCategory,categoryController.previewResizeAddCategory);

router.post("/postCategory",multerConfig.postCategory,categoryController.postCategory);

router.post("/postEditCategory",multerConfig.postEditCategory,categoryController.postEditCategory);

router.post("/postblockUnblock",categoryController.postblockUnblock);

module.exports = router;
