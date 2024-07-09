
const wishListModel = require('../../models/wishlistModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartModel');
const wishlistModel = require('../../models/wishlistModel');
const categoryModel = require('../../models/categoryModel');
const walletModel = require('../../models/walletModel');



exports.getWallet = async (req, res, next) => {
    try {
        const category = await categoryModel.find();
        const email = req.session.user;
        const user = await userModel.findOne({ email });
        const userId = user._id;
        const cart = await cartModel.findOne({ userId });

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch wallets with pagination
        const wallets = await walletModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalWallets = await walletModel.countDocuments({ userId });
        const totalPages = Math.ceil(totalWallets / limit);

        const walletBalance = user.walletAmount;
        let productNumber = 0;
        if (cart) {
            productNumber = cart.items.length;
        }

        res.render('user/wallet', { category, productNumber, user, wallets, walletBalance, page, totalPages, limit });
    } catch (error) {
        console.error('Error in getWallet:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};




exports.addToWallet = async (req, res, next) => {
    try {
        const { walletTopup, transaction } = req.body;
        const email = req.session.user;

        if (!walletTopup || !transaction) {
            return res.status(400).send('Invalid request: Missing required fields.');
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found.');
        }

        const userId = user._id;
        let wallet = await walletModel.findOne({ userId });

        if (wallet) {
            // Update existing wallet
            wallet.transactions.push(transaction);
            wallet.amount += walletTopup;
        } else {
            // Create a new wallet
            wallet = new walletModel({
                userId: userId,
                transactions: [transaction],
                amount: walletTopup
            });
        }

        await wallet.save();
        res.status(200).send('Wallet updated successfully.');
    } catch (error) {
        console.error('Error adding to wallet:', error);
       
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};
