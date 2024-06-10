const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for buffer
const fileStorage = multer.diskStorage({
    destination : (req,file,cb) =>{
     cb(null,'uploads');
    },
    filename: (req,file,cb) => {
        cb(null,Date.now() +'-'+file.originalname);
    }
}
);
const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/png'  || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
        cb(null,true);
    }else{
        cb(null,false);
    }
};


exports.previewResizeAddCategory = multer({storage:storage,fileFilter:fileFilter}).single("image");

exports.postCategory = multer({storage:storage,fileFilter:fileFilter}).single("categoryImage");

exports.postEditCategory = multer({storage:fileStorage,fileFilter:fileFilter}).single("editCategoryImage");