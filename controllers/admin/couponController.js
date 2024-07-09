const Coupon = require('../../models/CouponModel'); 

exports.getCoupon = async(req,res,next) => {
    try {
        const coupons = await Coupon.find({}); // Fetch all coupons from the database
        res.render('user/admincoupons', { coupons });
    } catch (error) {
      console.error('Error in getCoupon:', error);
      res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
   
    
}




exports.addCoupon = async (req, res,next) => {
  try {
    console.log('The add Coupon backend function hits ')
    const {
      couponCode,
      discountType,
      discountValue,
      expirationDate,
      minimumPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      isActive
    } = req.body;
    let isListed ;
  if(isActive==='on'){
    isListed = true;
    }else{
        isListed = false
    }
    // Validate discount value based on discount type
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 60)) {
      return res.status(400).json({ error: 'Percentage discount value must be between 1 and 60' });
    }

    // Create a new coupon object
    const newCoupon = new Coupon({
      code: couponCode,
      discountType,
      discountValue,
      expirationDate,
      minimumPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      isActive:isListed
    });

    // Save the coupon to the database
    await newCoupon.save();

    res.status(201).json({ message: 'Coupon added successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Error in addCoupon:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


exports.editCoupon = async (req, res, next) => {
  try {
    const { 
      editCouponCode, 
      editDiscountType, 
      editDiscountValue, 
      editExpirationDate, 
      editMinimumPurchaseAmount, 
      editMaxDiscountAmount, 
      editUsageLimit, 
      editIsActive 
    } = req.body;

    // Parse expirationDate to a valid Date object
    const expirationDate = new Date(editExpirationDate);

    // Set isActive based on the value of editIsActive
    const isActive = editIsActive === 'on';

    const coupon = await Coupon.findOneAndUpdate(
      { code: editCouponCode }, // Find the coupon by its code
      {
        discountType: editDiscountType,
        discountValue: editDiscountValue,
        expirationDate: expirationDate,
        minimumPurchaseAmount: editMinimumPurchaseAmount,
        maxDiscountAmount: editMaxDiscountAmount || null,
        usageLimit: editUsageLimit || null,
        isActive: isActive
      },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('Error in editCoupon:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};
