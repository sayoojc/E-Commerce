const mongoose =require("mongoose")

const schema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false,
        required:true
       
    },
    googleId:{
        type:String
    },
    walletAmount:{
        type:Number,
        default:0
    },
    referralCode:{
        type:String,
        required:true
    }
    
   
});


const collectionModel = mongoose.model("Users",schema);
module.exports =collectionModel;