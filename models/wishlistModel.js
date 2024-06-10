const mongoose = require('mongoose')
wishListSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    products:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Products'
        }
    }]
})
module.exports = mongoose.model('Wishlist',wishListSchema);