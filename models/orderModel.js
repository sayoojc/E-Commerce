const mongoose = require('mongoose')
    orderSchema = new mongoose.Schema({
        user :{
           type:mongoose.Schema.Types.ObjectId,
           ref:'Users',
           required:true
        },
        products:[{
          productImage:{
           type:String,
          },
            productName: {
                type:String,
                required:true
            },
            productId:{
            type:String,
            required:true
            },
            description:{
                type:String,
                required:true
            },
            count : {
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
             orderStatus:{
                type : String
            },
            orderStatusUpdatedAt: {
              type: Date
            },
            statusReason:{
              type:String
            },
            priceAfterDiscount:{
              type:Number
            }
        }],
        address:{
               address1:{
                 type:String,
                 required:true
               },
               address2:{
                 type:String,
                 required:true
               },
               phone:{
                 type:Number,
                 required:true
               },
               locality:{
                 type:String,
                 required:true
               },
               pincode:{
                 type:Number,
                 required:true
               },
               city:{
                 type:String,
                 required:true
               },
               state:{
                 type:String,
                 required:true
               }
        },
        cartValue:{
            type:Number,
        },
        discountAmount:{
          type:Number,
          default:0
        },
        orderDate:{
          type : Date,
          default:Date.now
        },
        coupon:{
            code: {
                type: String,
              
            },
            discountType: {
                type: String,
                enum: ['percentage', 'fixed'],
               
            },
            discountValue: {
                type: Number,
            },
        },
        payment:{
            paymentType:{
                type:String,
            },
            amount:{
                type:Number
            },
            status:{
                type:String
            }
            
            
        }
    })

    module.exports = mongoose.model("Order",orderSchema)