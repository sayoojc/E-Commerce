

const orderModel = require('../../models/orderModel');



exports.getAdminOrdersPage = async (req, res,next) => {
    try {
        const orders = await orderModel.find()
            .populate('user')
            .populate('orders.product_id')
            .populate('address')
            .exec();
            console.log('orders from order controller function',orders);
        res.render('user/adminOrders', { orders });
    } catch (error) {
        console.error('Error in getAdminOrdersPage:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};
