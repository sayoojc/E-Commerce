
const categoryModel = require('../../models/categoryModel');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartModel');
const couponModel = require('../../models/CouponModel');
exports.getCoupons = async(req,res,next) => {
    try {
        const email = req.session.user;
        const user = userModel.findOne({email});
        const userId = user._id;
        const cart = cartModel.findOne({userId});
        let productNumber = 0;
        if(cart&&cart.items){
          productNumber = cart.items.length;  
        }
        
        const category = await categoryModel.find();
        const coupons = await couponModel.find({isActive:true});
        res.render('user/coupon',{category,productNumber,user,coupons});
    } catch (error) {
      console.error('Error in getCoupons:', error);
      res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
       
    }
    
}


exports.redeemCoupon = async (req, res,next) => {
    try {
      
      
      // Check if the user session exists
      const email = req.session.user;
      if (!email) {
        return res.status(400).json({ success: false, message: 'User not logged in' });
      }
  
      // Fetch user from the database
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const userId = user._id;
  
      // Fetch cart for the user
      const cart = await cartModel.findOne({ userId }).populate('items.productId');
      if (!cart || !cart.items || !cart.items.length) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
  
      // Calculate total price
      const totalPrice = cart.items.reduce((acc, curr) => {
        return acc + (curr.productId.price * curr.quantity);
      }, 0);
  
      let totalPayable = totalPrice < 1000 && totalPrice >= 1 ? totalPrice + 59 : totalPrice;

      
  
      // Validate coupon code
      const { couponCode } = req.body;
      if (!couponCode) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
      }
  
      const coupon = await couponModel.findOne({ code: couponCode });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
  
      
  
      const { discountType, discountValue, expirationDate, minimumPurchaseAmount, maxDiscountAmount, usageLimit, usageCount, isActive } = coupon;
  
      if (!isActive) {
        return res.status(400).json({ success: false, message: 'Coupon is not active' });
      }
  
      if (new Date() > new Date(expirationDate)) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
  
      if (totalPrice < minimumPurchaseAmount) {
        return res.status(400).json({ success: false, message: `Minimum purchase amount is ${minimumPurchaseAmount}` });
      }
  
      if (usageLimit && usageCount >= usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
      }
  
      let discountAmount;
      if (discountType === 'percentage') {
        discountAmount = (totalPrice * discountValue) / 100;
        if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
          discountAmount = maxDiscountAmount;
        }
      } else {
        discountAmount = discountValue;
      }
  
      totalPayable -= discountAmount;
  
      // Increment the usage count of the coupon
      coupon.usageCount += 1;
      await coupon.save()//
  
      res.status(200).json({ success: true, totalPayable,coupon });
    } catch (error) {
      console.error('Error in redeemCoupon:', error);
      res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
  };
  