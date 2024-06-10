const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    categoryName : {
        type:String
    },
    imageURL :{
        type:String
    },
    isBlocked:{
        type:Boolean,
        default:false,
        required:true
       
    }
});


const categoryCollection = mongoose.model('Category',categorySchema);
module.exports = categoryCollection;