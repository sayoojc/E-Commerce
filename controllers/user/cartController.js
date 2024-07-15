const mongoose = require("mongoose");
const cartModel = require("../../models/cartModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const addressModel = require("../../models/addressModel");
const categoryModel = require("../../models/categoryModel");
const orderModel = require("../../models/orderModel");
const wishlistModel = require("../../models/wishlistModel");
const walletModel = require("../../models/walletModel");
const couponModel = require("../../models/CouponModel");
const moment = require("moment");

exports.getCart = async (req, res, next) => {
  try {
   
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const category = await categoryModel.find();
    const addresses = await addressModel.find({ user: userId });
    const wishlist = await wishlistModel
      .findOne({ userId: userId })
      .populate("products.product_id");

   

    let address;
    if (addresses.length > 0) {
      address = addresses.find((addr) => addr.default) || addresses[0];
    }



    const cart = await cartModel
      .findOne({ userId })
      .populate("items.productId");
    if (!cart) {
      return res.render("user/cart", {
        items: [],
        totalPrice: 0,
        totalPayable: 0,
        productNumber: 0,
        category,
        address,
        addresses,
        wishlist,
      });
    }

    const totalPrice = cart.items.reduce((acc, curr) => {
      return acc + curr.productId.price * curr.quantity;
    }, 0);

    let totalPayable;
    if (totalPrice < 1000 && totalPrice >= 1) {
      totalPayable = totalPrice + 59;
    } else {
      totalPayable = totalPrice;
    }
    const productNumber = cart.items.length;

    const cartItems = cart.items.map((item) => {
      return {
        productId: item.productId._id,
        name: item.productId.productName,
        description: item.productId.description,
        price: item.productId.price,
        quantity: item.quantity,
        total: item.productId.price * item.quantity,
        image: item.productId.image, // Include the image field
      };
    });

    res.render("user/cart", {
      items: cartItems,
      totalPrice,
      totalPayable,
      productNumber,
      category,
      address,
      addresses,
      wishlist,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).send("Internal Server Error");
    // error.status = 500;
    // next(error);
  }
};

/////////////////////////////////////////////////////////////////////////////////

exports.addToCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const quantity = parseInt(req.body.count, 10); // Convert count to an integer
    const email = req.session.user; // Assuming you have user information available in req.session.user
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (!quantity || quantity < 1) {
      return res.redirect(
        `/getProductDetail/${productId}?error=invalidQuantity`
      );
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
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingItemIndex >= 0) {
      // Update quantity for the existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to the cart
      cart.items.push({
        productId: new mongoose.Types.ObjectId(product._id),
        quantity: quantity,
      });
    }


    await cart.save();

    res.redirect("/getCart");
  } catch (error) {
    console.error("Error in addToCart:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const email = req.session.user;
    const productId = req.params.productId;
   
    const user = await userModel.findOne({ email });
    const userId = user._id;

    await cartModel.updateOne(
      { userId: userId }, // Find the cart by ID
      { $pull: { items: { productId: productId } } } // Pull the item with the given product ID from the items array
    );

    res.status(200).json({ message: "product removed successfully" });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

exports.changeAddress = async (req, res, next) => {
  try {
    const { selectedAddressId } = req.body;

    const email = req.session.user;

    // Update the user's selected address in the database
    const user = await userModel.findOne({ email: email });
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
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });
    }

    res.json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error("Error in changeAddress:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const category = await categoryModel.find();
    const email = req.session.user;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const userId = user._id;
    const addresses = await addressModel.find({ user: userId });

    const cart = await cartModel
      .findOne({ userId })
      .populate("items.productId");
    if (!cart) {
      res.redirect("/getCart");
    }

    let totalPrice = 0;
    let totalPayable = 0;
    let productNumber = 0;
    let cartItems = [];

    if (cart && cart.items) {
      totalPrice = cart.items.reduce((acc, curr) => {
        return acc + curr.productId.price * curr.quantity;
      }, 0);

      if (totalPrice < 1000 && totalPrice >= 1) {
        totalPayable = totalPrice + 59;
      } else {
        totalPayable = totalPrice;
      }

      productNumber = cart.items.length;

      cartItems = cart.items.map((item) => {
        return {
          productId: item.productId._id,
          name: item.productId.productName,
          description: item.productId.description,
          price: item.productId.price,
          quantity: item.quantity,
          total: item.productId.price * item.quantity,
          image: item.productId.image, // Include the image field
        };
      });
    }

    res.render("user/checkout", {
      category,
      productNumber,
      user,
      addresses,
      cart,
      items: cartItems,
      totalPayable,
      totalPrice,
    });
  } catch (error) {
    console.error("Error in getCheckout:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

////////////////razorpay////////////////////

const Razorpay = require("razorpay");

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    
    let { amount, currency } = req.body;
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: "rzp_test_59UVvgnLyIsqyL",
      key_secret: "2RQ3L2OKHxDxgzrotzheJXTB",
    });
amount = parseInt(amount);
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: "receipt#1",
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);
    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
      
    });
  } catch (error) {
    console.error("Error in createRazorpayOrder:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

////////////order confirmation////////////

exports.confirmOrder = async (req, res, next) => {
  try {
    const {
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      coupon,
      amount,
    } = req.body;

    const userEmail = req.session.user;

    const appliedCoupon = await couponModel.findById(coupon);


    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is not defined" });
    }

    // Verify Razorpay payment if the payment method is Razorpay
    if (paymentMethod === "razorpay") {
      const crypto = require("crypto");
      const generatedSignature = crypto
        .createHmac("sha256", "YOUR_RAZORPAY_KEY_SECRET")
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");
      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ error: "Invalid Razorpay signature" });
      }
    }

    // Retrieve user's ID based on email
    const user = await userModel.findOne({ email: userEmail });
    const userId = user._id;
    const address = await addressModel.findOne({
      default: true,
      user: userId,
    });
    if (!address) {
      return res
        .status(400)
        .json({ error: "Address is required to place an order" });
    }

    // Find user's cart items
    const cart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");
    

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
   

    // Check and update stock levels
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.productName}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    let orderAmount = 0;
    cart.items.forEach((item) => {
      if (item.productId) {
        orderAmount += item.productId.price * item.quantity;
      } 
    });
   
    if (paymentMethod === "cod" && amount >= 1000) {
      return res
        .status(400)
        .json({ error: "Payment above 1000 is not allowed for COD" });
    }
    let payment;
    payment = {
      paymentType: paymentMethod,
      amount: amount,
      status: "paid",
    };
    
    if (paymentMethod === "cod") {
      
      payment = {
        paymentType: paymentMethod,
        amount: amount,
        status: "pending",
      };
    }

    // Construct order objects
    const orderItems = cart.items.map((item) => ({
      productName: item.productId.productName,
      productImage: item.productId.image[0],
      description: item.productId.description,
      productId: item.productId._id,
      count: item.quantity,
      price: item.productId.price,
      orderStatus: "confirmed", // Default status
      orderStatusUpdatedAt: Date.now(),
    }));

    // Create order document
    const newOrder = await orderModel.create({
      user: user._id,
      products: orderItems,
      cartValue: orderAmount,
      address: address,
      payment: payment,
      ...(appliedCoupon && { coupon: appliedCoupon }),
    });

    

    // Remove cart items from cartModel
    await cartModel.findOneAndDelete({ userId: userId });

    res
      .status(200)
      .json({
        success: true,
        message: "Order confirmed successfully",
        productName: orderItems,
        orderId:newOrder._id
      });

  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





exports.retryConfirmOrder = async (req, res) => {
  try {
    
    
    const { orderId, amount, paymentMethod } = req.body;
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).send('Missing required fields');
    }

    const order = await orderModel.findById(orderId);
    
    if (!order) {
      
      return res.status(404).send('Order not found');
    }

    

order.products.forEach(product =>{
  product.orderStatus = 'confirmed';
});
   order.payment.status = 'paid';

    await order.save();

    // If additional actions are needed, such as updating the order status or re-initiating the payment, add them here.

    res.status(200).json({ success: true, message: 'Retry payment success' });



  } catch (error) {
    console.error('Error in retryConfirmOrder:', error);
    res.status(500).send('Internal Server Error');
  }
};









exports.getOrderHistoryPage = async (req, res, next) => {
  try {
     
      const email = req.session.user;
      const user = await userModel.findOne({ email });
      const userId = user._id;
      const category = await categoryModel.find();
      const cart = await cartModel.findOne({ userId });

      let productNumber;
      if (cart && cart.items) {
          productNumber = cart.items.length;
      } else {
          productNumber = 0;
      }

      if (!user) {
          return res.status(404).send("User not found");
      }

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      // Search query
      const search = req.query.search || "";

      // Fetch orders with pagination and search
      const orders = await orderModel.find({ 
          user: userId, 
          "products.productName": { $regex: search, $options: "i" } 
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

      const totalOrders = await orderModel.countDocuments({ 
          user: userId, 
          "products.productName": { $regex: search, $options: "i" } 
      });
      const totalPages = Math.ceil(totalOrders / limit);

      res.render("user/userOrders", {
          orders,
          category,
          productNumber,
          user,
          page,
          totalPages,
          limit,
          search
      });
  } catch (error) {
      console.error("Error in getOrderHistoryPage:", error);
      res
          .status(error.status || 500)
          .json({ error: error.message || "Internal Server Error" });
  }
};





exports.getOrderDetailPage = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const category = await categoryModel.find();
    const orderId = req.params.orderId;
   

    const cart = await cartModel.findOne({ userId });
    const order = await orderModel.findById(orderId);

    let productNumber;
    if (cart && cart.items) {
      productNumber = cart.items.length;
    } else {
      productNumber = 0;
    }

    res.render("user/orderDetail", { category, productNumber, order, user });
  } catch (error) {
    console.error(error);
    console.log("error from the get order detail function");
  }
};



exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId, productId, count, cancelReason } = req.body;

    // Find the order by orderId
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the product within the order's products array by productId
    const product = order.products.find(product => product.productId === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found in the order' });
    }

    // Update the product's orderStatus, orderStatusUpdatedAt, and statusReason
    product.orderStatus = 'cancel request sent';
    product.orderStatusUpdatedAt = Date.now();
    product.statusReason = cancelReason;

    // Save the updated order
    await order.save();

    res.status(200).json({ success: true, message: 'Cancellation request sent' });
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    res
      .status(error.status || 500)
      .json({ error: error.message || 'Internal Server Error' });
  }
};


const PDFDocument = require("pdfkit-table");
const path = require("path");
const fs = require("fs");

exports.getInvoiceDownload = async (req, res) => {
  try {
    const { orderId } = req.params;
   

    const order = await orderModel.findOne({ _id: orderId });

    if (!order) {
      
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 30 });
    
    // Set the response to download the PDF
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${orderId}.pdf`
    );
    doc.pipe(res);

    // Invoice Header
    doc.fontSize(20).text("Tax Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order Id: ${orderId}`);
    doc.text(`Invoice No: FANT${order._id.toString().slice(-6)}`);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.text(`Sold By:\nNutromax pvt ltd,\nA 850 NEAR,Technopark, kazhakkoottam - 201102`);
    doc.text(`GST: UNREGISTERED`);

    doc.moveDown();
    doc.text(`Shipping ADDRESS:\n${order.address.address1}, ${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`);

    doc.moveDown();
    
    // Order Details Table
    const table = {
      title: "Product Details",
      headers: ["Product Name", "Description", "Price"],
      rows: order.products
        .filter(product => product.orderStatus === 'delivered')
        .map(product => [
          product.productName,
          product.description,
          product.price
        ])
    };
    
    let productCount = order.products.length;
    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10)
    });

    doc.moveDown();
    
   let totalPrice = 0;
   
   order.products.filter(product => product.orderStatus === 'delivered')
   .map(product =>{
    totalPrice+=product.price
   });
   let discountAmount = 0;
if(order.coupon && order.coupon.discountType === 'percentage'){
  let discountValue = order.coupon.discountValue;
  order.products.filter(product => product.orderStatus === 'delivered')
  .map(product =>{
   let discount = product.price*discountValue/100
   discountAmount += discount ;
  })
}

if(order.coupon && order.coupon.discountType === 'fixed'){
  let discountValue = order.coupon.discountValue;
  order.products.filter(product =>product.orderStatus === 'delivered')
  .map(product =>{
    let a = discountValue/productCount
    let discount = product.price-discountValue;
    discountAmount +=discount;
  });
}

    // Totals
    doc.text(`Total Price: ${totalPrice}`);
    doc.text(`Discount: ${discountAmount}`);
    doc.text(`Total Amount: ${totalPrice - discountAmount}`);

    // Footer
    doc.moveDown();
    doc.text("Ordered Through\nNutromax E-Commerce App\n", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.failedRazorPayOrder = async (req, res) => {
  try {
    
    const { amount, coupon, paymentMethod } = req.body;
    
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    
    const userId = user._id;
    const cart = await cartModel
      .findOne({ userId })
      .populate("items.productId");
    
    const address = await addressModel.findOne({ default: true, user: userId });
    
    const appliedCoupon = await couponModel.findById(coupon);
   
    if (!address) {
      return res
        .status(400)
        .json({ error: "Address is required to place an order" });
    }
    

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let orderAmount = 0;
    cart.items.forEach((item) => {
      if (item.productId) {
        orderAmount += item.productId.price * item.quantity;
      } 
    });
    let payment;

    payment = {
      paymentType: paymentMethod,
      amount: amount / 100,
      status: "Failed",
    };
    // Construct order objects
    const orderItems = cart.items.map((item) => ({
      productName: item.productId.productName,
      productImage: item.productId.image[0],
      description: item.productId.description,
      productId: item.productId._id,
      count: item.quantity,
      price: item.productId.price,
      orderStatus: "Order Pending", // Default status
    }));

    // Create order document
    if (appliedCoupon) {
      const newOrder = await orderModel.create({
        user: user._id,
        products: orderItems,
        cartValue: orderAmount,
        address: address,
        payment: payment,
        coupon: appliedCoupon,
      });
      
    } else {
      const newOrder = await orderModel.create({
        user: user._id,
        products: orderItems,
        cartValue: orderAmount,
        address: address,
        payment: payment,
      });
      
    }
    await cartModel.findOneAndDelete({ userId: userId }); ///////////delete items in the cart

    res
      .status(200)
      .json({ success: true, message: "Failed order saved successfully." });
  } catch (error) {
    console.error("Error storing the failed payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//////////////////inc cart controller////////////////////////

exports.increaseProductNo = async (req, res) => {
  try {
    
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const context = req.body.context;
    
    const productId = req.body.productId;
    
    // Find the user's wishlist
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the specific product in the wishlist
    const product = cart.items.find(
      (p) => p.productId.toString() === productId
    );
    if (!product) {
      
      return res.status(404).json({ error: "Product not found in Cart" });
    }

    // Check current count and context
    let newCount;
    if (context === "decrement") {
      newCount = product.quantity - 1;
      if (newCount < 1) {
        return res
          .status(400)
          .json({ error: "Product count cannot be less than 1" });
      }
    } else {
      newCount = product.quantity + 1;
      if (newCount > 5) {
        return res.status(400).json({ error: "Product count cannot exceed 5" });
      }
    }

    // Update the product count
    await cartModel.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": newCount } },
      { new: true, useFindAndModify: false }
    );
    
    res
      .status(200)
      .json({ message: "The product number updated successfully" });
  } catch (error) {
    console.error("Error updating the product number in the wishlist", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};










exports. returnProduct = async (req, res) => {
  try {
    const { orderId, productId,returnReason } = req.params;

    // Find the order by orderId and update product status
    const order = await orderModel.findById(orderId);
   

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const product = order.products.find(prod => prod.productId === productId);

    if (!product) {
      return res.status(404).send('Product not found in order');
    }
  

      
    product.orderStatus = 'return request send'; // Update orderStatus field as needed
    product.orderStatusUpdatedAt = Date.now();
    product.statusReason = returnReason;
    await order.save();

    res.status(200).json({ success: true, message: 'Order request send' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
