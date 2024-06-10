
const wishListModel = require('../../models/wishlistModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartModel');
const wishlistModel = require('../../models/wishlistModel');



exports.addToWishlist = async (req, res,next) => {
    try {
        const productId = req.params.productId;
        const email = req.session.user;
        const user = await userModel.findOne({ email });

        console.log('The product id from the params :',productId);

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
    } catch (err) {
        err.status = 500;
        next(err);
    }
};


exports.removeFromWishlist = async(req,res,next) => {
    try {
        const productId = req.body.productId;
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
    } catch (err) {
        err.status = 500;
    next(err);
    }
    
}