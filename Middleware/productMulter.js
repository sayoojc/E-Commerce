const multer = require('multer');
const fileStorage = multer.diskStorage({
    destination : (req,file,cb) =>{
     cb(null,'uploads/products');
    },
    filename: (req,file,cb) => {
        cb(null,file.filename+'productImage'+file.originalname);
    }
}
);
const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/png'  || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ||file.mimetype === 'image/webp') {
        cb(null,true);
    }else{
        cb(null,false);
    }
};



exports.postProducts = multer({storage:fileStorage,fileFilter:fileFilter}).array("productImage[]",3);

exports.postEditProducts = multer({storage:fileStorage,fileFilter:fileFilter}).array("editProductImage[]",3);