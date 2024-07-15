
const orderModel = require('../../models/orderModel');


exports.getOrderManagenent = async(req,res) => {
try {
    const { startDate, endDate, filterOption } = req.query;

    // Determine the date range based on the filterOption
    let start, end;
    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    }
    else if (filterOption === 'weekly') {
        start = moment().startOf('week').toDate();
        end = moment().endOf('week').toDate();
    } else if (filterOption === 'monthly') {
        start = moment().startOf('month').toDate();
        end = moment().endOf('month').toDate();
    } else  if (filterOption === 'daily') {
        start = moment().startOf('day').toDate();
        end = moment().endOf('day').toDate();
    }  else {
        start = new Date(0);  // default to epoch start if no dates are provided
        end = new Date();     // default to now if no dates are provided
    }

    // Create a query object to hold the date range
    let query = {
        orderDate: {
            $gte: start,
            $lte: end
        }
    };

    // Fetch all orders within the date range
   
    // Fetch non-cancelled orders within the date range
    const orders = await orderModel.find({
        ...query,
        'orders.orderStatus': { $ne: 'Cancelled' }
    })    .populate('user')
   
    
    // Step 2: Extract unique user IDs
    const uniqueUserIds = new Set(orders
        .filter(order => order.user !== null) // Ensure user is not null
        .map(order => order.user.toString())
    );
const orders1 = orders.sort((a,b) => b.orderDate-a.orderDate);
    // Step 3: Get the unique user count
    const uniqueUserCount = uniqueUserIds.size;

    // Calculate total order amount
    const totalOrderAmount = orders1.reduce((acc, curr) => acc + curr.payment.amount, 0);
    console.log('the total order amount:',totalOrderAmount);

    res.render('user/orderManagement', { orders1, totalOrderAmount, uniqueUserCount,start,end });

} catch (error) {
   console.error(error); 
}
}




exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, productId, newStatus } = req.body;

    // Find the order by ID
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Find the product in the order
    const product = order.products.find(p => p.productId === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in the order' });
    }
let orgProdPrice = product.price;
let discount = 0;


if(order.coupon && order.coupon.discountType === 'percentage'){
 discount = orgProdPrice*order.coupon.discountValue/100
 orgProdPrice = orgProdPrice-discount;
}
  

  if(newStatus === 'Cancelled' || newStatus === 'returned'){
    order.payment.amount-=orgProdPrice;
  }




    // Update the order status of the product
    product.orderStatus = newStatus;
    product.orderStatusUpdatedAt = new Date();

    // Save the updated order
    await order.save();

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
