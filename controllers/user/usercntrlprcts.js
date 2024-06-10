//post Controll//

exports.postLogin = async (req,res) => {
  const data = {
    email:req.body.email,
    password:req.body.password,
    confirmPassword:req.body.confirmPassword
  };

  try{
    const user = await User.find({
      email:data.email,
      password:data.password,
      confirmPassword:data.confirmPassword,
    });

    if(user.length===0){
      res.render('user/userlogin',{message:"User not exists"});
      console.log('user not exists');
    } else {
      req.session.user = {
        email:data.email,
      };
      res.redirect("user/home");
    }
  }catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
};


exports.postSignup = async (req,res) => {
  const {name,email,password,confirmPassword} = req.body;
  try {
    const existUser = await User.findOne({ email });
    if(existUser) {
      return res.render("user/signUp",{message : "user already exists"});
    }
    const generatedOtp = Math.floor(1000+Math.random() * 9000).toString();
    req.session.signupData = {
      name,
      email,
      password,
      confirmPassword,
    };
    const newOtp = new otp({
      email,
      otp: generatedOtp,
    });
    await newOtp.save();
    const mailBody = `Your OTP for registration is ${generatedOtp}`;
    await mailSender(email,"Registration OTP",mailBody);
    res.redirect("user/otp")
  }  catch (error) {
    console.error(error);
  }
 };
 const mailSender = async(email,title,body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:process.env.USER_EMAIL,
        password:process.env.USER_APP
      },
    });
    let info = await transporter.sendMail({
      from: "www.nutromax.com",
      to:`${email}`,
      subject:`${title}`,
      html:`${body}`
    });
    return info;
  }  catch (error) {
    console.log(error.message);
  }
};


exports.postOtp = async (req,res) => {
  try{
    const {n1,n2,n3,n4} = req.body;
    
   const isValidInput = n1&&n2&&n3&&n4&& /^\d+$/.test(n1 + n2 + n3 + n4);
   
   if(!isValidInput) {
    return res.render("user/otp",{message: "Only numeric values without white spaces"})
   }
   
  const otpData = `${n1}${n2}${n3}${n4}` ;
  const signupData = req.session.signupData;
  
  if(!signupData) {
    return res.json({error:"User data not found.please sign up"});
  }
  const otpRecord = await otp.findOne({email:signupData.email});

  if(!otpRecord) {
    return res.json({error:"OTP not found please resend otp"})
  }
  if(otpData === otpRecord.otp){
    const newUser = new User({
      name:signupData.name,
      email:signupData.email,
      password:signupData.password,
      confirmPassword:signupData.confirmPassword,
    });
    await newUser.save();
    delete req.session.signupData;
    res.redirect("user/userlogin")
  } else {
    return res.render('otp',{message:"Incorrect otp.please try again"})
  }

  } catch (error) {
    res.status(500).json({ error:"internal server error"});
  }
}


exports.postLogout = (req,res) =>{

  req.session.user = null;
  req.session.destroy((err)=>{

    if(err){
 
      console.error("Error destroying session:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }else{

      res.redirect("/login");
    }
  })
  
}





exports.postSignup = async(req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.render('user/signUp', { error: 'Passwords do not match', name, email });
  }

  // Check for empty fields and email format
  if (name === '') {
    return res.render('user/signUp', { error: 'Name field is required', email });
  }
  if (email === '') {
    return res.render('user/signUp', { error: 'Email field is required', name });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('user/signUp', { error: 'Please enter a valid email address', name });
  }
  if (password === '') {
    return res.render('user/signUp', { error: 'Password field is required', name, email });
  }
  if (confirmPassword === '') {
    return res.render('user/signUp', { error: 'Please confirm your password', name, email });
  }

  try{
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.render('user/signUp',{error:"user already exists"});
    }
    const secret = otp.utils.generateSecret();
const token = otp.generate(secret, { length: 6 });

console.log('Generated OTP:', token);
req.session.otp = token;
const mailBody = `Your OTP for registration is ${generatedOtp}`;
await mailSender(email,"Registration OTP",mailBody);
  }
 
  catch(error){
    console.error(error);
  }
  const mailSender = async(email,title,body) =>{
   try{
    let transporter = nodemailer.createTransport({
      service:"gmail",
      auth: {
        user:process.env.USER_EMAIL,
        password:process.env.USER_APP
      },
    });
    let info = await transporter.sendMail({
      from:"wwww.nutromax.com",
      to:`${email}`,
      subject:`${title}`,
      html:`${body}`
    });
    return info;
   } catch (error) {
    console.log(error.message);
   }
  }

};
