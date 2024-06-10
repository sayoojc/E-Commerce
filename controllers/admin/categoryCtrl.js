const { json } = require('body-parser');
const categoryModel = require('../../models/categoryModel');
const { render } = require('ejs');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const productModel = require('../../models/productModel');
////////Get the category page  /////
exports.getCategory = async (req, res) => {
    try {
        if(req.session.admin){
            const categories = await categoryModel.find({});
    

            res.render('user/adminCategory', {data: categories,error: req.flash("error")} );
        }
      else{
        res.redirect('/admin/adminLogin');
      }
        
       
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

///////////////Crop add category image/////////






exports.previewResizeAddCategory = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const resizedImageBuffer = await sharp(req.file.buffer)
            .resize(400, 400)
            .toBuffer();

        res.set('Content-Type', req.file.mimetype);
        res.send(resizedImageBuffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Error resizing image for preview");
    }
};



////////////Add Category/////////////



exports.postCategory = async (req, res) => {
    try {
        console.log('post category hits');
        if (req.session.admin) {
            const { addCategoryName } = req.body;
            const existingCategory = await categoryModel.findOne({ categoryName: { $regex: new RegExp('^' + addCategoryName + '$', 'i') } });

            let imageurl;
            const date = Date.now();
            if (req.file) {
                const resizedImageBuffer = await sharp(req.file.buffer)
                    .resize(400, 400)
                    .toBuffer();

                const imageDir = path.join(__dirname, '..','..', 'uploads','Categories');
                if (!fs.existsSync(imageDir)) {
                    fs.mkdirSync(imageDir);
                }

               

                const resizedImagePath = path.join(imageDir, `resized_${date}_${path.basename(req.file.originalname)}`);
                fs.writeFileSync(resizedImagePath, resizedImageBuffer);
                // imageurl = resizedImagePath;
            } else {
                return res.json({ errorMessage: "Image field cannot be empty" });
            }

            if (!addCategoryName || !addCategoryName.trim()) {
                return res.json({ errorMessage: "Category name cannot be empty" });
            }

            if (addCategoryName !== addCategoryName.trim()) {
                return res.json({ errorMessage: "No space allowed before and after category name" });
            }

            if (existingCategory) {
                return res.json({ errorMessage: "Category is already existing" });
            }
            const relativePath = `uploads/categories/resized_${date}_${path.basename(req.file.originalname)}`;

            const newCategory = new categoryModel({
                categoryName: addCategoryName,
                imageURL: relativePath
            });
            await newCategory.save();

            return res.status(201).json({ message: "Category added successfully" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
};




//////////Edit Category//////////////

exports.postEditCategory = async (req, res) => {
 
    try {
        const categoryId=req.body.categoryId;
        const updateCategory = req.body.editCategoryName;
        const image = req.file;
        const data = await categoryModel.findById(categoryId); 
        const allCategories = await categoryModel.findOne({$and:[{categoryName:updateCategory},{_id:{$ne:data._id}}]});
        
       

       
        if(allCategories){
            return res.json({ errorMessage: "Category is already existing" });
        }
       
        let imageUrl;
        if(image){
             imageUrl = image.path;
             console.log(imageUrl);
        }
        
        if(data){
            data.categoryName=updateCategory;
            if(imageUrl){
                data.imageURL=imageUrl;
            }
            await data.save();
            res.status(201).json({message:'success'});
        }
    } catch (error) {
        console.log("Error in the post edit category controller",error);
        res.status(500).send('internal server error');
    }
}



///////Block Category////////

exports.postblockUnblock = async(req,res) => {
    try {
        console.log('postblockUnblock category hits');
       const categoryId = req.body.id
       console.log(`The category id from the front end is${categoryId}`);
       const category = await categoryModel.findById(categoryId) ;
       console.log(category);
       if(category.isBlocked===true){
           category.isBlocked=false;
           await category.save();
       }else{
        category.isBlocked = true;
        await category.save();
       }
       res.status(201).json({message:'success'});
    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error')
    }
}




