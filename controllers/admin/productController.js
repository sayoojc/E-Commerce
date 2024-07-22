

const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


///////// Get the product page////////

exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const searchQuery = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build the search filter
        let searchFilter = {};
        if (searchQuery) {
            searchFilter = {
                $or: [
                    { productName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                ]
            };
        }

        const products = await productModel.find(searchFilter)
            .populate("category")
            .skip(skip)
            .limit(limit)
            .exec();

        const totalProducts = await productModel.countDocuments(searchFilter);

        res.render("user/adminProduct", {
            error: req.flash("error"),
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            limit,
            searchQuery
        });

    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};



////////////Get the Add product page/////////////
exports.getAddProducts = async (req,res,next) => {
    try {
        const categories = await categoryModel.find({});
        res.render("user/add-product",{categories:categories,error:''});
    } catch (error) {
        console.error('Error in getAddProducts:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}


/////////////Get the edit product page////////////
exports.getEditProducts = async(req,res,next) =>{
    try {
        const productId = req.params.productId;
        const categories = await categoryModel.find({});
        const product = await productModel.findOne({_id:productId});
        res.render("user/edit-product",{categories,product,error:''});
    } catch (error) {
        console.error('Error in getEditProducts:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}

/////////Post the product /////////////////

exports.postProducts = async (req, res,next) => {
    try {
        console.log('post products hits');
        const { name, description, category, price, stock } = req.body;
        const croppedImages = req.body.croppedImage; // Cropped images data URLs

        // Handle file uploads
        console.log('The file uploaded is ', req.files);
        const imageUrls = req.files.map(file => file.path);
        console.log(imageUrls);

        // Validation
        let errors = [];

        if (!name || name.trim() === '') {
            errors.push('Product Name is required');
        }

        if (!category || category.trim() === '') {
            errors.push('Category Name is required');
        }

        if (!price || isNaN(price.trim())) {
            errors.push('Price must be a number');
        }

        if (!stock || isNaN(stock.trim())) {
            errors.push('Stock must be a number');
        }

        if (!description || description.trim() === '') {
            errors.push('Description is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        } else {
            console.log('Validation completed');

            // Find category ID
            const productCategory = await categoryModel.findOne({ categoryName: category });

            if (!productCategory) {
                return res.status(400).json({ errors: ['Invalid category'] });
            }

            // Ensure the uploads directory exists
            const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Determine which images to use
            let finalImages = [];

            // Iterate through each selected image
            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                const croppedImageDataURL = req.body[`croppedImage${i}`]; // Check if image is cropped

                if (croppedImageDataURL) {
                    // If image is cropped, save it to the filesystem
                    const base64Data = croppedImageDataURL.replace(/^data:image\/\w+;base64,/, "");
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    const fileName = `${uuidv4()}.png`;

                    // Construct the file path relative to the uploads directory
                    const filePath = path.join(uploadsDir, fileName);

                    fs.writeFileSync(filePath, imageBuffer);
                    // Save relative path
                    finalImages.push(path.join('uploads', 'products', fileName));
                } else {
                    // If image is not cropped, use the original image relative path
                    const relativePath = path.relative(path.join(__dirname, '..', '..'), imageUrl);
                    finalImages.push(relativePath.replace(/\\/g, '/')); // Ensure consistent use of forward slashes
                }

                // Break loop if finalImages has 3 images
                if (finalImages.length === 3) {
                    break;
                }
            }

            // Create new product
            const newProduct = new productModel({
                image: finalImages,
                productName: name,
                category: productCategory._id,
                price,
                stock,
                description,
            });

            await newProduct.save();
            return res.redirect("/admin/getProducts");
        }
    } catch (error) {
        console.error('Error in postProducts:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};


///////Block unblock product////////

exports.postblockUnblockProduct = async(req,res,next) => {
    try {
        console.log('postblockUnblock product hits');
       const productId = req.body.id
       console.log(`The category id from the front end is${productId}`);
       const product = await productModel.findById(productId) ;
      
       
       if(product.isBlocked===true){
           product.isBlocked=false;
           await product.save();
       }else{
        product.isBlocked = true;
        await product.save();
       }
       res.status(201).json({message:'success'});
    } catch (error) {
        console.error('Error in postblockUnblockProduct:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}
/////////////Edit products///////////////

exports.postEditProducts = async (req, res,next) => {
    try {
        console.log('post edit products hit');
        const updateProductName = req.body.name;
        const description = req.body.description;
        const category = req.body.category;
        const price = req.body.price;
        const stock = req.body.stock;
        const images = req.files;
        const productId = req.params.productId;
        console.log(updateProductName, description, category, price, stock, images, productId);

        let imageUrls = [];
        if (images && images.length > 0) {
            imageUrls = images.map(file => file.path);
            console.log(imageUrls);
        }

        console.log('image urls are:', imageUrls);
        const product = await productModel.findById(productId);
        console.log('The product which should edit', product);

        if (!updateProductName) {
            req.flash("error", 'Product Name is required');
            return res.redirect('/admin/getProducts');
        } else if (updateProductName.trim() === '') {
            req.flash("error", 'No space is allowed before and after product name');
            return res.redirect('/admin/getProducts');
        }

        if (!category || category.trim() === '') {
            req.flash("error", 'Category Name is required');
            return res.redirect('/admin/getProducts');
        } else if (category.trim() === '') {
            req.flash("error", 'No space is allowed before and after the category name');
            return res.redirect('/admin/getProducts');
        }

        if (!price || isNaN(price.trim())) {
            req.flash("error", 'Price must be a number');
            return res.redirect('/admin/getProducts');
        }

        if (!stock || isNaN(stock.trim())) {
            req.flash("error", 'Stock must be a number');
            return res.redirect('/admin/getProducts');
        }

        if (!description) {
            req.flash("error", 'Enter the description');
            return res.redirect('/admin/getProducts');
        } else if (description.trim() === '') {
            req.flash("error", 'No space allowed before and after the description');
            return res.redirect('/admin/getProducts');
        }

        if (!product) {
            req.flash("error", 'Failed to fetch product details');
            return res.redirect('/admin/getProducts');
        }

        const categoryId = await categoryModel.findOne({ categoryName: category }).select('_id');

        // Check if category exists
        if (!categoryId) {
            req.flash("error", 'Invalid category');
            return res.redirect('/admin/getProducts');
        }

        // If no new images are uploaded, retain the existing ones
        if (imageUrls.length === 0) {
            imageUrls = product.image;
        }

        product.productName = updateProductName;
        product.description = description;
        product.category = categoryId;
        product.price = price;
        product.stock = stock;
        product.image = imageUrls; // Assuming imageURL is the correct field name

        await product.save();
        return res.redirect('/admin/getProducts');
    } catch (error) {
        console.error('Error in postEditProducts:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};
