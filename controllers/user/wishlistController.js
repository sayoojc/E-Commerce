
const wishListModel = require('../../models/wishlistModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartModel');
const wishlistModel = require('../../models/wishlistModel');
const categoryModel = require('../../models/categoryModel');




exports.getWishlist = async(req,res,next) => {
    try {
        const category = await categoryModel.find();
        const email = req.session.user;
        const user = await userModel.findOne({email});
        const userId = user._id;
        const cart = await cartModel.findOne({userId});
        let productNumber = 0;
        if(cart){
          productNumber = cart.items.length;  
        }
        const wishlist = await wishlistModel.findOne({userId}).populate('products.product_id') ;
        res.render('user/wishlist',{wishlist,category,productNumber,user});

    } catch (error) {
        console.error('Error in getWishlist:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}

exports.addToWishlist = async (req, res,next) => {
    try {
       
        const productId = req.params.productId;
        const email = req.session.user;
        const user = await userModel.findOne({ email });


        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        let wishlist = await wishListModel.findOne({ userId: userId });

        if (wishlist) {
            // If wishlist exists, check if product already in wishlist
            const productExists = wishlist.products.some(item => item.product_id.equals(productId));
            if (!productExists) {
                wishlist.products.push({ product_id: productId });
            }
        } else {
            // If wishlist doesn't exist, create a new one
            wishlist = new wishListModel({
                userId: userId,
                products: [{ product_id: productId }]
            });
        }

        await wishlist.save();

      
      
          res.status(200).send({ message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error in addToWishlist:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};


exports.removeFromWishlist = async(req,res,next) => {
    try {
        
            const productId = req.body.productId 
       
   
    const email = req.session.user;
     const user = await userModel.findOne({email});
    const userId = user._id;
    const wishlist = await wishlistModel.findOne({ userId });

    if (!wishlist) {
        return res.status(404).send({ error: 'Wishlist not found' });
    }

    // Pull the product from the wishlist
    wishlist.products = wishlist.products.filter(item => !item.product_id.equals(productId));

    // Save the updated wishlist
    await wishlist.save();

    res.status(200).send({ message: 'Product deleted from wishlist' });
    } catch (error) {
        console.error('Error in removeFromWishlist:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
    
}

exports.increaseProductNo = async (req, res) => {
    try {
        
        const email = req.session.user;
        const user = await userModel.findOne({ email });
        const userId = user._id;
        const context = req.body.context;
        
        const productId = req.body.productId;
        
        // Find the user's wishlist
        const wishlist = await wishListModel.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        // Find the specific product in the wishlist
        const product = wishlist.products.find(p => p.product_id.toString() === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found in wishlist' });
        }

        // Check current count and context
        let newCount;
        if (context === 'decrement') {
            newCount = product.count - 1;
            if (newCount < 1) {
                return res.status(400).json({ error: 'Product count cannot be less than 1' });
            }
        } else {
            newCount = product.count + 1;
            if (newCount > 5) {
                return res.status(400).json({ error: 'Product count cannot exceed 5' });
            }
        }

        // Update the product count
        await wishListModel.findOneAndUpdate(
            { userId, 'products.product_id': productId },
            { $set: { 'products.$.count': newCount } },
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ message: 'The product number updated successfully' });
    } catch (error) {
        console.error('Error updating the product number in the wishlist', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};
