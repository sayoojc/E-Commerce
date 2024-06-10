const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Schema for the cart
const CartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items:[{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }]
 
});


module.exports = mongoose.model('Cart', CartSchema);
