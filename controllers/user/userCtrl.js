const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const categoryModel = require('../../models/categoryModel');
const wishlistModel = require('../../models/wishlistModel');
const cartModel = require('../../models/cartModel');
const otpModel = require('../../models/otpModel');
const nodemailer = require("nodemailer");
const { render } = require('ejs');
const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
const { totp } = require('otplib');
const express = require('express');
const app = express();
const mailSender = require('../../config/mailer'); // Adjust the path as needed
const bcrypt = require('bcrypt');


const ITEMS_PER_PAGE  = 5;




////get Home and post home ////


exports.getHome = async(req, res) => {
  try {
    const products = await  productModel.find();
    const category = await categoryModel.find();
  res.render("user/index",{products,category});
  
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

};
exports.getHomeAfterLogin = async(req,res) => {
 
    const products = await  productModel.find({isBlocked:false});
    const category = await categoryModel.find({isBlocked:false});
    const email = req.session.user;
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const cart = await cartModel.findOne({userId}).populate('items.productId');
    let productNumber
    if(cart){
     productNumber= cart.items.length;
    }else{
      productNumber = 0;
    }
     
    
    res.render('user/home',{products,category,productNumber});

}

/////Get signup and post signup /////

exports.getSignup = (req, res) => {
  if(req.session.user){
    return res.redirect("/getHome")
  }
    return res.render("user/signUp",{error:req.flash("error")});
    
};





exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  app.locals = {
    email,
    name,
    password
  };


  try {
    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/getSignUp");
    }

    if (name.trim() !== name) {
      req.flash("error", "White space before the name is not allowed");
      return res.redirect("/getSignUp");
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Email is required");
      return res.redirect("/getSignUp");
    }
     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(!strongPasswordRegex.test(password)) {
      req.flash('error','password should contain At least one lowercase letter,one uppercase letter,one digit,one special character and Minimum length of 8 characters');
      return res.redirect("/getSignUp");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Password doesn't match");
      return res.redirect("/getSignUp");
    }

    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(name)) {
      req.flash("error", "The name should not contain any special characters");
      return res.redirect("/getSignUp");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "The user already exists");
      return res.redirect("/getSignUp");
    }

    // Generate OTP
    const token = totp.generate(secret);
    console.log(`Token generated for OTP is ${token}`);

    // Store OTP and its expiration time in session
    // req.session.otp = token;
    
  const otp = new otpModel({
    email,
    otp:token,
    createdAt:Date.now()
  });

  await otp.save();


    // req.session.otpExpireTime = Date.now() + 60000; // 60 seconds from now
    // req.session.credentials = { name, email, password, confirmPassword };
    // console.log('Session credentials set:', req.session.credentials);
    // console.log(`The OTP stored in req.session.otp is ${req.session.otp}`);
    
    // Clear OTP after 60 seconds
    // setTimeout(() => {
    //   if (req.session) {
    //     delete req.session.otp;
    //     delete req.session.otpExpireTime;
    //     console.log("OTP removed from session after 60 seconds from the post signup method");
    //   }
    // }, 60000);

    // Send OTP via email
    const mailBody = `Your OTP for registration is ${token}`;
    await mailSender(email, 'Registration OTP', mailBody);

    return res.redirect('/getOtp');
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).send('Internal Server Error');
  }
};


/////Get otp and post otp////
exports.getOtp = (req, res) => {
  
  res.render("user/otp",{error:req.flash('error')});
};


exports.postOtp = async (req, res) => {
  try {
    const { first, sec, third, fourth, fifth, sixth } = req.body;
    const enteredOtp = `${first}${sec}${third}${fourth}${fifth}${sixth}`;


 const {email,name,password} = app.locals;

    const credentials = await otpModel.findOne({email});

    if (credentials && credentials.otp === enteredOtp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new userModel({
        name: name,
        email: email,
        password: hashedPassword,
      });

      await newUser.save();
   

      res.redirect("/getLogin");
    } else {
      req.flash("error", 'Enter the correct OTP');
      res.redirect("/getOtp");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




/////////////////////resend otp////////////////////////////
// Resend OTP function


exports.resendOtp = async (req, res) => {
  try {
    console.log('Resend OTP function hits');

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

    // return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//////////Get google///////
exports.getGoogle=(req,res,next)=>{
  req.session.user=req.user._id
  console.log('The req.session.user in the getGoogle function is',req.session.user)
  res.redirect("/getHome");
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
      console.log('The user is blocked');
      return res.redirect("/getLogin");
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Password does not match");
      return res.redirect("/getLogin");
    }

    console.log(`The user details retrieved from the database: ${user}`);
    req.session.user =data.email; // Storing the email in the session
    console.log(`The req.session.user in the post login is ${JSON.stringify(req.session.user)}`);

    res.redirect('/getHome');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


///////////Get product detail page//////////

exports.getProductDetail = async(req,res) => {
  try {
   
      const productId = req.params.productId;
      const product =  await productModel.findById({_id:productId});
      res.render("user/productdetail",{product});
   
  
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
    
}







/////post logout////


exports.postLogout = (req,res) => {
  //  req.session.user = null;
  
    req.session.destroy ((err) => {
      if(err){
        res.status(500).json({error:"Internal server error"});
      }else{
        res.redirect("/");
        console.log(`The session after logout is : ${req.session}`)
      }
     });
}







/////////////////////////filter and search////////////////////////


exports.getProductList=async (req,res,next)=>{   
  console.log('the get products function hits');
  const category=req.query.categoryId;
  let action=req.params.action;
  const page=+req.query.page||1;
  const search=req.query.search;
  let searchquery,userName;
  const email = req.session.user;
  const user = await userModel.findOne({email});
  const userId = user._id;
  if(search){
      searchquery=true;
  }
  (req.session.user) ? userName=true : userName=false
  try{
      let product_count;
      const wishlist=await wishlistModel.findOne({userId});
      const categories=await categoryModel.find({isBlocked:false});
      const products=await filterProducts(action,page,search,searchquery,category)
      if(category&&searchquery){
          product_count=await productModel.find({isBlocked:false,productName: { $regex: search, $options: 'i' },category:category}).countDocuments();
      }else if(searchquery){
          product_count=await productModel.find({isBlocked:false,productName: { $regex: search, $options: 'i' }}).countDocuments();
      }else if(category){
          product_count=await productModel.find({isBlocked:false,category:category}).countDocuments();
      }else{
          product_count=await productModel.find({isBlocked:false}).countDocuments();
      }
    console.log(product_count)
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
          userName:userName
      })
  }catch(err){
      console.log(err)
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