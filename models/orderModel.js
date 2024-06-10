const mongoose = require('mongoose')
    orderSchema = new mongoose.Schema({
        user :{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Users'
        },
        orders:[{
            product_id: {
                type : mongoose.Schema.Types.ObjectId,
                ref:'Products'
            },
            count : {
                type:Number
            },
            price:{
                type:Number
            },
            address:{
                type : mongoose.Schema.Types.ObjectId,
                ref :'Address'
            },
            payment:{
                type:String
            },
            orderDate:{
                type : Date
            },
            orderStatus:{
                type : String
            },
            coupon:{
                type:String
            }
        }]
    })

    module.exports = mongoose.model("Order",orderSchema)