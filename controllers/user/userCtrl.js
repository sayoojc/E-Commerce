const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const categoryModel = require('../../models/categoryModel');
const wishlistModel = require('../../models/wishlistModel');
const cartModel = require('../../models/cartModel');
const otpModel = require('../../models/otpModel');
const walletModel = require('../../models/walletModel');
const orderModel = require('../../models/orderModel');
const nodemailer = require("nodemailer");
const { render } = require('ejs');
const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
const { totp } = require('otplib');
const express = require('express');
const app = express();
const mailSender = require('../../config/mailer'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const e = require("connect-flash");
const mongoose = require('mongoose');


const ITEMS_PER_PAGE  = 8;




////get Home and post home ////


exports.getHome = async(req, res) => {
  try {
    const products = await  productModel.find({isBlocked:false}).limit(18);
    const latestProducts = await productModel.find({ isBlocked: false }).sort({ addedDate: -1 }).limit(6);
    const category = await categoryModel.find({isBlocked:false});
   
    const mostSoldProducts = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.count" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 6 },
    ]);
    
    // Extract productIds from mostSoldProducts
    const productIds = mostSoldProducts.map(item => item._id);
    
    // Fetch detailed product information
    const productsData = await productModel.find({ _id: { $in: productIds } });
    
    // Combine totalSold with product details
    const mostSoldProductsDetails = mostSoldProducts.map(item => {
      const productDetail = productsData.find(product => product._id.toString() === item._id.toString());
      return {
        _id: item._id,
        productName: productDetail ? productDetail.productName : "Unknown",
        description: productDetail ? productDetail.description : "",
        price: productDetail ? productDetail.price : "",
        productImage: productDetail ? (productDetail.image.length > 0 ? productDetail.image[0] : "") : "",
        totalSold: item.totalSold,
      };
    });
    

    
    
    
    let productNumber = 0;
    
     
    
    res.render('user/index',{products,category,productNumber,latestProducts,mostSoldProductsDetails});
  } catch (error) {
    console.error('Error in getHome:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }

};
exports.getHomeAfterLogin = async(req,res,next) => {
  try {
    const products = await  productModel.find({isBlocked:false}).limit(18);
    const latestProducts = await productModel.find({ isBlocked: false }).sort({ addedDate: -1 }).limit(6);
    const category = await categoryModel.find({isBlocked:false});
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const cart = await cartModel.findOne({userId}).populate('items.productId');
    const mostSoldProducts = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.count" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 6 },
    ]);
    
    // Extract productIds from mostSoldProducts
    const productIds = mostSoldProducts.map(item => item._id);
    
    // Fetch detailed product information
    const productsData = await productModel.find({ _id: { $in: productIds } });
    
    // Combine totalSold with product details
    const mostSoldProductsDetails = mostSoldProducts.map(item => {
      const productDetail = productsData.find(product => product._id.toString() === item._id.toString());
      return {
        _id: item._id,
        productName: productDetail ? productDetail.productName : "Unknown",
        description: productDetail ? productDetail.description : "",
        price: productDetail ? productDetail.price : "",
        productImage: productDetail ? (productDetail.image.length > 0 ? productDetail.image[0] : "") : "",
        totalSold: item.totalSold,
      };
    });
    

    
    
    
    let productNumber
    if(cart){
     productNumber= cart.items.length;
    }else{
      productNumber = 0;
    }
     
    
    res.render('user/home',{products,category,productNumber,latestProducts,mostSoldProductsDetails});
  } catch (error) {
    console.error('Error in getHomeAfterLogin:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
 


}

/////Get signup and post signup /////

exports.getSignup = (req, res,next) => {
  try {
    const referralCode = req.params.referralCode;
    req.session.inviteCode = referralCode;////////////saving the referral code as the invite code in the session//////////
    if(req.session.user){
      return res.redirect("/getHome")
    }
      return res.render("user/signUp",{error:req.flash("error")});
  } catch (error) {
    console.error('Error in getSignup:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
  
    
};





exports.postSignup = async (req, res,next) => {
  const { name, email, password, confirmPassword } = req.body;
  app.locals = {
    email,
    name,
    password
  };


  try {
    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/getSignUp/referralCode");
    }

    if (name.trim() !== name) {
      req.flash("error", "White space before the name is not allowed");
      return res.redirect("/getSignUp/referralCode");
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Email is required");
      return res.redirect("/getSignUp/referralCode");
    }
     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(!strongPasswordRegex.test(password)) {
      req.flash('error','password should contain At least one lowercase letter,one uppercase letter,one digit,one special character and Minimum length of 8 characters');
      return res.redirect("/getSignUp/referralCode");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Password doesn't match");
      return res.redirect("/getSignUp/referralCode");
    }

    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(name)) {
      req.flash("error", "The name should not contain any special characters");
      return res.redirect("/getSignUp/referralCode");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "The user already exists");
      return res.redirect("/getSignUp/referralCode");
    }

    // Generate OTP
    const token = totp.generate(secret);
    console.log(`Token generated for OTP is ${token}`);

    
    
  const otp = new otpModel({
    email,
    otp:token,
    createdAt:Date.now()
  });

    await otp.save();

    // Send OTP via email
    const mailBody = `Your OTP for registration is ${token}`;
    await mailSender(email, 'Registration OTP', mailBody);

    return res.redirect('/getOtp');
  } catch (error) {
    console.error('Error in postSignup:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


/////Get otp and post otp////
exports.getOtp = (req, res,next) => {
  try {
    res.render("user/otp",{error:req.flash('error')});
  } catch (error) {
    console.error('Error in getOtp:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
 
};


exports.postOtp = async (req, res,next) => {
  try {
    const { first, sec, third, fourth, fifth, sixth } = req.body;
    const enteredOtp = `${first}${sec}${third}${fourth}${fifth}${sixth}`;

    const { email, name, password } = app.locals;

    const credentials = await otpModel.findOne({ email });

    if (credentials && credentials.otp === enteredOtp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      /////////////////function to generate the referral code/////////////
      function generateReferralCode(userId) {
        const cleanedUserId = userId.replace(/\s+/g, '').toUpperCase();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${cleanedUserId}-${randomString}`;
      }

      const referralCode = generateReferralCode(name);
      let newUser;
      let isinvited;

      // Check if the user was invited through a referral code
      if (req.session.inviteCode) {
        isinvited = await userModel.findOne({ referralCode: req.session.inviteCode });
      }

      if (isinvited) {
        newUser = new userModel({
          name: name,
          email: email,
          password: hashedPassword,
          referralCode: referralCode,
          walletAmount: 50
        });
        await newUser.save();

        const newUser1 = await userModel.findOne({ email });
        const userId = newUser1._id;

        const newWalletHistory = new walletModel({
          userId: userId,
          description: '50 Rupees credited for joining through the referral',
          amount: 50
        });
        await newWalletHistory.save();

        isinvited.walletAmount = (isinvited.walletAmount || 0) + 150;
        await isinvited.save();

        const newWalletHistory1 = new walletModel({
          userId: isinvited._id,
          description: '150 Rupees credited for referring a new user',
          amount: 150,
          createdAt: Date.now()
        });
        await newWalletHistory1.save();
      } else {
        newUser = new userModel({
          name: name,
          email: email,
          password: hashedPassword,
          referralCode: referralCode
        });
        await newUser.save();
      }
      res.redirect("/getLogin");
    } else {
      req.flash("error", 'Enter the correct OTP');
      res.redirect("/getOtp");
    }
  } catch (error) {
    console.error('Error in postOtp:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};





/////////////////////resend otp////////////////////////////
// Resend OTP function


exports.resendOtp = async (req, res,next) => {
  try {

    // Generate OTP
    const token = totp.generate(secret);
console.log('The resend otp is :',token);
    const {email,name,password} = app.locals;
   
    
   const credentials = await otpModel.findOne({email});
   if(credentials){
    credentials.email=email,
    credentials.otp=token,
    createdAt=Date.now
    await credentials.save();
   }else{
    const otp = new otpModel({
      email,
      otp:token,
      createdAt:Date.now()
    });
  
    await otp.save();
   }


    // Send OTP via email
    const mailBody = `Your OTP for registration is ${token}`;
    await mailSender(email, 'Registration OTP', mailBody);
res.redirect('/getOtp');
  } catch (error) {
    console.error('Error in resendOtp:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


////////////forgot password////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.forgotPassword = (req,res) => {
  try {
    res.render('user/forgotpassword',{error:req.flash('error')});
  } catch (error) {
    console.log(error);
  }
 
}

exports.forgotPasswordOtpPage = (req,res) => {
  try {
    res.render('user/forgotPassOtp',{error:req.flash('error')});
  } catch (error) {
    console.error(error);
  }
}

exports.postForgotPassword = async(req,res) =>{
  try {
    const email = req.body.user_email;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
 app.locals.forgotEmail = email;
  if(!email){
    req.flash("error",'Enter an email to continue!');
    res.redirect('/forgotPassword');
  }

  if(email.trim()!==email){
    req.flash("error","No spaces are allowed before and after the email address!")
  }

  if(!emailRegex.test(email)){
    req.flash("error",'Enter valid email address!');
    res.redirect('/forgotPassword');
  }
  const user = await userModel.findOne({email});
  if(!user){
    
    req.flash("error",'User not found!');
   return res.redirect('/forgotPassword')
  }
if(user.email===email){
  const token = totp.generate(secret);
  
 
const mailBody = `Your otp for resetting the password is ${token}`;
  await mailSender(email,'Forgot Password OTP',mailBody);
  const otp = new otpModel({
    email,
    otp:token,
    createdAt:Date.now()
  });
  await otp.save();
  req.flash('error','');
  res.redirect('/getForgotPassOtpPage');
}
  
  } catch (error) {
    console.log('error in the otp sending and otp page rendering function');
    console.error(error);
  }
  

}

exports.ChangePasswordOtp = async(req,res) => {
  try {
    
    const { first, sec, third, fourth, fifth, sixth } = req.body;
    const enteredOtp = `${first}${sec}${third}${fourth}${fifth}${sixth}`;
    
    const email = app.locals.forgotEmail;
    const otp  = await otpModel.findOne({email});

    if(otp.otp===enteredOtp){
      
            const user = await userModel.findOne({email});
            if(!user){
              req.flash("error",'Failed to fetch user Data!');
              res.redirect('/forgotPassword');
            }
            res.render('user/newPassword',{error:req.flash('error')});
    } else {
      req.flash("error",'The otp entered is incorrect!');
      res.redirect('/getForgotPassOtpPage');
    }
  } catch (error) {
    console.error(error);
  }
}

exports.putForgotPassword = async (req, res) => {
  try {
    
    const email = app.locals.forgotEmail;
    
    const  password = req.body.password;
    const confirmPassword  = req.body.confirmPassword;
    
    

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (!confirmPassword) {
      return res.status(400).json({ error: 'Please re-enter the password to continue!' });
    }
    if (confirmPassword !== password) {
      return res.status(400).json({ error: 'Passwords do not match!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while changing the password' });
  }
};

/////get Login and Post login//////

exports.getLogin=(req,res)=>{
 
  if(req.session.user){
    return res.redirect("/getHome")
  }
  res.render("user/userlogin",{error:req.flash("error")});
  
};



exports.postLogin = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password
    };
    const user = await userModel.findOne({ email: data.email });
  
    if (!user) {
      req.flash("error", "User does not exist");
      return res.redirect("/getLogin");
    }

    if (user.googleId) {
      req.flash("error", "You have already signed in with Google");
      return res.redirect("/getLogin");
    }

    if (user.isBlocked) {
      req.flash("error", "The user is blocked");
      
      return res.redirect("/getLogin");
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Password does not match");
      return res.redirect("/getLogin");
    }

    
    req.session.user =data.email; // Storing the email in the session
    

    res.redirect('/getHome');
  } catch (error) {
    console.error('Error in postLogin:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


///////////Get product detail page//////////

exports.getProductDetail = async(req,res,next) => {
  try {
   
      const productId = req.params.productId;
      if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
        return res.redirect('/404');
     }
      const product =  await productModel.findById({_id:productId}).populate('category');
      res.render("user/productdetail",{product});
   
  
  } catch (error) {
    console.error('Error in getProductDetail:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
    
}







/////post logout////


exports.postLogout = (req,res,next) => {
 try {
  req.session.destroy ((err) => {
    if(err){
      res.status(500).json({error:"Internal server error"});
    }else{
      res.redirect("/");
      
    }
   });
 } catch (error) {
  console.error('Error in postLogout:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
 }
  
   
}







/////////////////////////filter and search////////////////////////


exports.getProductList=async (req,res,next)=>{   
  
  const category=req.query.category;
  if (category && !mongoose.Types.ObjectId.isValid(category)) {
   return res.redirect('/404');
}
  let action=req.params.action;
  const page=+req.query.page||1;
  const search=req.query.search;
  let searchquery,userName;
  const email = req.session.user;
  const user = await userModel.findOne({email});
  
  const ca = await categoryModel.find(); 
  const userId = user._id;
  const cart  = await cartModel.find({userId});
  let number = 0;
  if(cart&& cart.items){
      number = cart.items.length;
  }
  if(search){
      searchquery=true;
  }
  (req.session.user) ? userName=true : userName=false
  try{
      let product_count;
      const wishlist=await wishlistModel.findOne({userId});
      const categories=await categoryModel.find({isBlocked:false});
      
      const allProducts=await filterProducts(action,page,search,searchquery,category);
      console.log('all products',allProducts);
      let products = allProducts.filter(product =>!product.category.isBlocked);
      console.log("products:",products);
      if(category&&searchquery){
          product_count=await productModel.find({isBlocked:false,productName: { $regex: search, $options: 'i' },category:category}).countDocuments();
      }else if(searchquery){
          product_count=await productModel.find({isBlocked:false,productName: { $regex: search, $options: 'i' }}).countDocuments();
      }else if(category){
          product_count=await productModel.find({isBlocked:false,category:category}).countDocuments();
      }else{
          product_count=await productModel.find({isBlocked:false}).countDocuments();
      }
    
      res.render("user/product",{
          products,
          currentPage: page,
          hasNextPage: (page*ITEMS_PER_PAGE)<product_count,
          hasPreviousPage: page>1,
          nextPage: page+1,
          previousPage: page-1,
          lastPage:Math.ceil(product_count / ITEMS_PER_PAGE),
          action:action,
          search: (search)?search : "",
          wishlist:wishlist,
          categories:categories,
          category:(category)?category : "",
          userName:userName,
          ca:ca,
          number:number
          
      })
  }catch(error){
    console.error('Error in getProductList:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
}
  
async function filterProducts(action,page,search,searchquery,category){   
      let products;
      let filter;
      if(action==="lowToHigh"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName:{ $regex: search, $options: 'i' }}
          products=await productModel.find(filter).sort({price:1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");  
      }else if(action==="highToLow"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName:{ $regex: search, $options: 'i' }}
          products=await productModel.find(filter).sort({price:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="newArrivals"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName:{ $regex: search, $options: 'i' }}
          products=await productModel.find(filter).sort({_id:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="aA-Zz"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName:{ $regex: search, $options: 'i' }}
          products=await productModel.find(filter).sort({productName:1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="Zz-aA"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName:{ $regex: search, $options: 'i' }}
          products=await productModel.find(filter).sort({productName:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="stock"&&searchquery){
          (category)? filter={isBlocked:false,productName:{ $regex: search, $options: 'i' },category:category,stock:{$ne:0}} : filter={isBlocked:false,productName: { $regex: search, $options: 'i' },stock:{$ne:0}}
          products=await productModel.find(filter).sort({productName:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="lowToHigh"){
          (category)? filter={isBlocked:false,category:category} : filter={isBlocked:false}
          products=await productModel.find(filter).sort({price:1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");  
      }else if(action==="highToLow"){
          (category)? filter={isBlocked:false,category:category} : filter={isBlocked:false}
          products=await productModel.find(filter).sort({price:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="newArrivals"){
          (category)? filter={isBlocked:false,category:category} : filter={isBlocked:false}
          products=await productModel.find(filter).sort({_id:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="aA-Zz"){
          (category)? filter={isBlocked:false,category:category} : filter={isBlocked:false}
          products=await productModel.find(filter).sort({productName:1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="Zz-aA"){
          (category)? filter={isBlocked:false,category:category} : filter={isBlocked:false}
          products=await productModel.find(filter).sort({productName:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(action==="stock"){
          (category)? filter={isBlocked:false,category:category,stock:{$ne:0}} : filter={isBlocked:false,stock:{$ne:0}}
          products=await productModel.find(filter).sort({productName:-1}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else if(searchquery){
          (category)? filter={isBlocked:false,productName: { $regex: search, $options: 'i' },category:category} : filter={isBlocked:false,productName: { $regex: search, $options: 'i' }}
          products=await productModel.find(filter).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category")
      }else if(category){
          products=await productModel.find({isBlocked:false,category:category}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }else{
          products=await productModel.find({isBlocked:false}).skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate("category");
      }
      return products;       
}