
const mongoose = require('mongoose');
const cartModel = require('../../models/cartModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const addressModel = require('../../models/addressModel');
const categoryModel = require('../../models/categoryModel');
const orderModel = require('../../models/orderModel');
const wishlistModel = require('../../models/wishlistModel');

exports.getCart = async (req, res,next) => {
  try {
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const category = await categoryModel.find();
    const addresses = await addressModel.find({ user: userId });
    const wishlist = await wishlistModel.findOne({userId:userId}).populate('products.product_id');

    let address;
    if (addresses.length > 0) {
      address = addresses.find(addr => addr.default) || addresses[0];
    }

    console.log(address);

    const cart = await cartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.render('user/cart', { items: [], totalPrice: 0, totalPayable: 0, productNumber: 0, category,address,addresses,wishlist });
    }

    const totalPrice = cart.items.reduce((acc, curr) => {
      return acc + (curr.productId.price * curr.quantity);
    }, 0);

    let totalPayable;
    if (totalPrice < 1000 && totalPrice >= 1) {
      totalPayable = totalPrice + 59;
    } else {
      totalPayable = totalPrice;
    }
    const productNumber = cart.items.length;

    const cartItems = cart.items.map(item => {
      return {
        productId: item.productId._id,
        name: item.productId.productName,
        description: item.productId.description,
        price: item.productId.price,
        quantity: item.quantity,
        total: item.productId.price * item.quantity,
        image: item.productId.image // Include the image field
      };
    });

    res.render('user/cart', { items: cartItems, totalPrice, totalPayable, productNumber, category, address,addresses,wishlist });
  } catch (err) {
    // console.error('Error retrieving cart:', error);
    // res.status(500).send('Internal Server Error');
    err.status = 500;
    next(err);
  }
};


/////////////////////////////////////////////////////////////////////////////////

exports.addToCart = async (req, res,next) => {
  try {
    const productId = req.params.productId;
    console.log('product id from the add to cart function',productId);
    const quantity = parseInt(req.body.count, 10); // Convert count to an integer
    const email = req.session.user; // Assuming you have user information available in req.session.user
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      // Create a new cart if none exists
      cart = new cartModel({ userId, items: [] });
    }

    if (!cart.items) {
      cart.items = [];
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (existingItemIndex >= 0) {
      // Update quantity for the existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to the cart
      cart.items.push({
        productId: new mongoose.Types.ObjectId(product._id),
        quantity: quantity
      });
    }

    // Update cart totals
    // cart.subtotal = cart.items.reduce((acc, item) => acc + (item.quantity * product.price), 0);
    // cart.tax = cart.subtotal * 0.1;  // Assuming a tax rate of 10%
    // cart.total = cart.subtotal + cart.tax;

    await cart.save()

    res.redirect('/getCart');
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

exports.removeFromCart = async (req,res,next) => {
  try {
    const email = req.session.user;
    const productId = req.params.productId;
    console.log('product id from the removeFrom cart',productId);
    const user  =await userModel.findOne({email});
    const userId = user._id;
   
    await cartModel.updateOne(
      { userId:userId }, // Find the cart by ID
      { $pull: { items: { productId: productId } } } // Pull the item with the given product ID from the items array
    );
    
  res.status(200).json({message:'product removed successfully'});
  } catch (err) {
    err.status = 500;
    next(err);
  }


  
}

exports.changeAddress = async(req,res,next) => {
  try {
    const { selectedAddressId } = req.body;
   
    const email = req.session.user;

    // Update the user's selected address in the database
    const user = await userModel.findOne({email:email});
    const userId = user._id;
  
    await addressModel.updateMany(
      { user: userId },
      { $set: { default: false } }
  );

  // Then, update the specific address to set default to true
  const updatedAddress = await addressModel.findByIdAndUpdate(
      selectedAddressId,
      { $set: { default: true } },
      { new: true }
  );

  if (!updatedAddress) {
      return res.status(404).json({ success: false, error: 'Address not found' });
  }

  res.json({ success: true, address: updatedAddress });
} catch (err) {
  err.status = 500;
  next(err);
}
}

exports.getCheckout = async (req, res,next) => {
  try {
    const category = await categoryModel.find();
    const email = req.session.user;
    
    const user = await userModel.findOne({ email });
   
    if (!user) {
      return res.status(404).send('User not found');
    }

    const userId = user._id;
    const addresses = await addressModel.find({ user: userId });

    const cart = await cartModel.findOne({ userId }).populate('items.productId');
    
    let totalPrice = 0;
    let totalPayable = 0;
    let productNumber = 0;
    let cartItems = [];

    if (cart && cart.items) {
      totalPrice = cart.items.reduce((acc, curr) => {
        return acc + (curr.productId.price * curr.quantity);
      }, 0);

      if (totalPrice < 1000 && totalPrice >= 1) {
        totalPayable = totalPrice + 59;
      } else {
        totalPayable = totalPrice;
      }

      productNumber = cart.items.length;

      cartItems = cart.items.map(item => {
        return {
          productId: item.productId._id,
          name: item.productId.productName,
          description: item.productId.description,
          price: item.productId.price,
          quantity: item.quantity,
          total: item.productId.price * item.quantity,
          image: item.productId.image // Include the image field
        };
      });
    }

    res.render('user/checkout', { category, productNumber, user, addresses, cart, items: cartItems, totalPayable, totalPrice });
  } catch (err) {
    err.status = 500;
    next(err);
  }
}







exports.confirmOrder = async (req, res,next) => {
  try {
    const { paymentMethod } = req.body;
    const userEmail = req.session.user;
    console.log('payment method:',paymentMethod);
    // Retrieve user's ID based on email
    const user = await userModel.findOne({ email: userEmail });
    const userId = user._id;
    const address = await addressModel.findOne({default:true, user: userId});
 
    // Find user's cart items
    const cart = await cartModel.findOne({ userId: userId }).populate('items.productId');
    console.log('cart from the order confirm controller',cart.items)
  

    if (!cart) {
      return res.status(404).send('Cart not found');
    }
      // Check and update stock levels
      for (const item of cart.items) {
       const product = item.productId;
       if (product.stock < item.quantity) {
         return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });
       }
       product.stock -= item.quantity;
       await product.save();
     }
    // Construct order objects
    const orderItems = cart.items.map(item => ({
      name:item.productId.productName,
      product_id: item.productId._id,
      count: item.quantity,
      price: item.productId.price,
      payment: paymentMethod,
      address: address._id, // Assuming address is sent in the request body
      orderDate: new Date(),
      orderStatus: 'Order Confirmed', // Default status
      coupon: req.body.coupon // Assuming coupon is sent in the request body
    }));

    // Create order document
    const newOrder = await orderModel.create({
      user: userId,
      orders: orderItems
      
    });

    console.log('new order:',newOrder);

    // Remove cart items from cartModel
    await cartModel.findOneAndDelete({ userId: userId });

    res.status(200).json({ message: 'Order confirmed successfully', order: newOrder,productName:orderItems });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

exports.getOrderHistoryPage = async (req, res,next) => {
  try {
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const category = await categoryModel.find();
    const cart = await cartModel.find({userId})
   
    let productNumber = 0;
    if (cart && cart.items) {
      productNumber = cart.items.length;
    }

    if (!user) {
      return res.status(404).send('User not found');
    }


    
    const orders = await orderModel.find({ user: userId }).populate('orders.product_id');

   
    res.render('user/userOrders', { orders,category,productNumber });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};




exports.cancelOrder = async (req, res,next) => {
  try {
    console.log('cancel order hits');
    const { orderId, productId,count } = req.body; // Destructure orderId and productId from the request body

    console.log('Order ID:', orderId);
    console.log('Product ID:', productId);

    

   
    // Find the order and update its status to 'Cancelled'
    const orderUpdate = await orderModel.findOneAndUpdate(
      { _id: orderId, 'orders.product_id': productId }, // Match order ID and product ID
      { $set: { 'orders.$.orderStatus': 'Cancelled' } }, // Update orderStatus field of matched product
      { new: true }
    );

    if (!orderUpdate) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increase the stock of the product by the canceled quantity
    product.stock += count;
    await product.save();
    if (orderUpdate.orders.length > 0) {
      res.status(200).json({ message: 'Product removed from order successfully' });
    } else {
      // If no products are left in the order, delete the entire order
      await orderModel.findByIdAndDelete(orderId);
      res.status(200).json({ message: 'Order deleted successfully' });
    }
  } catch (err) {
    err.status = 500;
    next(err);
  }
};