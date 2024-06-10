

const orderModel = require('../../models/orderModel');



exports.getAdminOrdersPage = async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate('user')
            .populate('orders.product_id')
            .populate('orders.address')
            .exec();
            console.log('orders from order controller function',orders);
        res.render('user/adminOrders', { orders });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error from get orders catch' });
    }
};
