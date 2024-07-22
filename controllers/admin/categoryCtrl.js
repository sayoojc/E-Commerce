const { json } = require('body-parser');
const categoryModel = require('../../models/categoryModel');
const { render } = require('ejs');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const productModel = require('../../models/productModel');


exports.getCategory = async (req, res, next) => {
    try {
        if (req.session.admin) {
            // Get page, limit, and search query from query parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const searchQuery = req.query.search || '';

            let query = {};
            if (searchQuery) {
                query = { categoryName: { $regex: searchQuery, $options: 'i' } }; // Case-insensitive search
            }

            // Calculate the total number of categories and pages
            const totalCategories = await categoryModel.countDocuments(query);
            const totalPages = Math.ceil(totalCategories / limit);

            // Fetch categories for the current page
            const categories = await categoryModel.find(query)
                .skip((page - 1) * limit)
                .limit(limit);

            res.render('user/adminCategory', {
                data: categories,
                error: req.flash("error"),
                currentPage: page,
                totalPages: totalPages,
                searchQuery: searchQuery
            });
        } else {
            res.redirect('/admin/adminLogin');
        }
    } catch (error) {
        console.error('Error in getCategory:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};



///////////////Crop add category image/////////






exports.previewResizeAddCategory = async (req, res,next) => {
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
        console.error('Error in previewResizeAddCategory:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};



////////////Add Category/////////////



exports.postCategory = async (req, res,next) => {
    try {
       
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
        console.error('Error in postCategory:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};




//////////Edit Category//////////////

exports.postEditCategory = async (req, res,next) => {
 
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
        console.error('Error in postEditCategory:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}



///////Block Category////////

exports.postblockUnblock = async(req,res,next) => {
    try {
       
       const categoryId = req.body.id
       
       const category = await categoryModel.findById(categoryId) ;
       
       if(category.isBlocked===true){
           category.isBlocked=false;
           await category.save();
       }else{
        category.isBlocked = true;
        await category.save();
       }
       res.status(201).json({message:'success'});
    } catch (error) {
        console.error('Error in postblockUnblock:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}






