const mongoose = require('mongoose')

    addressSchema = new mongoose.Schema({
        user:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Users'
        },
        name : {
            type:String,
            required:true
        },
        address1:{
            type : String,
            required:true
        },
        address2:{
          type : String,
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
        pincode : {
            type : Number,
            required:true
        },
        city:{
            type :String,
            required:true
        },
        state:{
            type : String,
            required:true
        },
        default:{
        type:Boolean,
        default:false,
        required:true
        }
        
    })

    module.exports = mongoose.model("Address",addressSchema);

  