const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    image:{
        type:Array
    },
    productName:{
        type:String
    },
    category:{
       
        type:Schema.Types.ObjectId,
        ref:'Category'
    },
    price:{
        type:Number
    },
    stock:{
        type:Number
    },
    description:{
        type:String
    },
    isBlocked:{
        type:Boolean,
        default:false,
        required:true 
    },
    addedDate:{
        type: Date 
    }
})

const productCollection = mongoose.model('Products',productSchema);
module.exports = productCollection;
