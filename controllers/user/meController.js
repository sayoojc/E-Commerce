const transporter = nodemailer.createTransport({
    service:"gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use true for port 465, false for all other ports
    auth: {
        user: process.env.USER,
        pass: process.env.USER_PASSWORD,
    },
});

// function otpgeneretor(signup_email){

//     let secret = authenticator.generateSecret();
//     let token = authenticator.generate(secret);
//         const info ={
//             from:{
//                 name:"Cloth Store",
//                 address:process.env.USER
//             }, // sender address
//             to: signup_email , // list of receivers
//             subject: "Verification Code", // Subject line
//             text: Your Verification Code is ${token}, // plain text body
//             html: <b>Your Verification Code is ${token}</b>, // html body
//             };
//             return {
//                 info,
//                 token
//             }
//         }


exports.getLogin=(req,res,next)=>{
    if(req.session.user)
    return res.redirect("/")
    res.render("user/userlogin")
}

exports.postLogin=async (req,res,next)=>{
    const {signin_email,signin_password}=req.body;
    try{
        const user=await User.findOne({email:signin_email})
        const pass=await bcrypt.compare(signin_password,user.password)
            if(pass&& !user.isBlocked){
                req.session.user=user._id;
                return res.status(200).json({message:"Success"})
            }else if(user.isBlocked){
                return res.status(401).json({message:"You are Blocked"})
            }else{
                return res.status(401).json({message:"Invalid Username Or Password"})
            }
    }catch(err){
        return res.status(401).json({message:err.message})
    }   
}

exports.getGoogle=(req,res,next)=>{
    req.session.user=req.user._id
    res.redirect("/")
}

exports.postLogout=async (req,res,next)=>{
    if(req.user){
        req.logout(function(err) {
            if (err) console.log(err);   
        })
        return res.redirect("/")
    }
    req.session.destroy(err=>{
        console.log(err)
        res.redirect("/")
    })
}

exports.postSignup=async (req,res,next)=>{
    
    const {action,formdata:{signup_name,signup_email,signup_password,signup_referral,otp}}=req.body
    
    try{
            const exist=await User.findOne({email:signup_email})
            if(exist){
                return res.status(409).json({message:"User Already Exists"})
            }
            else if(!signup_email||!signup_password){
                return res.status(400).json({message:"All Fields Must Be Filled"})
            }
            else if(!validator.isEmail(signup_email)){
                return res.status(400).json({message:"Email not valid"})
            }
            else if(!validator.isStrongPassword(signup_password)){
                return res.status(400).json({message:"Password Not Strong Enough"})
            }
            else{
                if(signup_referral){
                    const referral=User.findOne({referralCode:signup_referral});
                    if(!referral)
                    return res.status(404).json({message:"Invalid Referral Code"})
                }

                const value=otpgeneretor(signup_email)
                await transporter.sendMail(value.info)
                req.session.data={signup_name,signup_email,signup_password,signup_referral}
                req.session.otp=value.token;
                setTimeout(()=>{ 
                    delete req.session.otp;
                },60000);
                return res.status(200).json({message:"Verification Code Send"});  
            } 
    }catch(err){
        console.log(err)
        res.status(400).json({message:"failed"})
    }
    
}

exports.postOtp=async (req,res,next)=>{

    const otp=req.body.formdata.otp 
    const action=req.body.action
    
    try{
        if(action){
        const value=otpgeneretor(req.session.data.signup_email)
        await transporter.sendMail(value.info)
        req.session.otp=value.token;
        setTimeout(()=>{ delete req.session.otp},60000);
        return res.status(200).json({message:"Enter The New Code"}); 
    }
        if(!(otp===req.session.otp)){
                return res.status(403).json({message:"Invalid Otp"})
            }
        const {signup_name,signup_email,signup_password,signup_referral}=req.session.data
        const referralCode=crypto.randomBytes(6).toString('hex');
        const user=await User.signup(signup_name,signup_email,signup_password,signup_referral,referralCode)
        if(signup_referral){
            const updateUser= await User.findOne({referralCode:signup_referral})
            if(updateUser){
                updateUser.wallet.balance+=100;
                user.wallet.balance+=100;
                user.referredCode=updateUser.referralCode
                await updateUser.save()
                await user.save()
            }
        }
        const cart=new Cart({
            user:user._id,
            items:[]
        })
        const wishlist=new Wishlist({
            user:user._id,
            items:[]
        })
        await cart.save();
        await wishlist.save();
        return res.status(201).json({message:"Enter Credentials to Login"});

    }catch(err){
        return res.status(400).json({message:"failed"})
    }
     
}

exports.postForgotEmail=async (req,res,next)=>{
    
    const email=req.body.email
    try{
            const user=await User.findOne({email:email});
            if(user){
                req.session.email=email
                const value=otpgeneretor(email)
                await transporter.sendMail(value.info)
                req.session.otp=value.token;
                setTimeout(()=>{req.session.otp=null},60000);
                return res.status(200).json({message:"Success"});
            }else{
                throw new Error("Email dosen't Exist")
            }

    }catch(err){
        return res.status(404).json({message:err.message})
    }
}

exports.postForgotOtp=async(req,res,next)=>{
    const otp=req.body.otp;
    if(otp===req.session.otp){
        req.session.change=true;
        return res.status(200).json({messsage:"Success"})
    }
    else
    return res.status(400).json({message:"Wrong Otp"})
}

exports.postForgotPassword=async (req,res,next)=>{
    if(req.session.change){
        delete req.session.change
        const password=req.body.password;
        const email=req.session.email;
        if(!validator.isStrongPassword(password)){
            return res.status(400).json({message:"Password Not Strong Enough"})
        }
        try{
                const user=await User.findOne({email:email});
                const salt=await bcrypt.genSalt(10)
                const hashedPassword=await bcrypt.hash(password,salt)
                user.password=hashedPassword;
                await user.save();
                return res.status(200).json({message:"Password Updated"});

        }catch(err){
            return res.status(500).json({message:err.message})
        } 
    }else{
        return res.status(500).json({message:"Error"})
    }
    
}


exports.putChangePassword=async (req,res,next)=>{
    try{
        const {currentPassword,newPassword,}=req.body
       const user=await User.findById(req.session.user);
       const pass=await bcrypt.compare(currentPassword,user.password)
       if(pass){

        if(!validator.isStrongPassword(newPassword)){
            return res.status(400).json({message:"Password Not Strong Enough"})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(newPassword,salt)
        user.password=hashedPassword;
        await user.save();
        res.status(200).json({message:"Successfully Created"})
       }else{
        res.status(400).json({message:"Invalid Password"})
       }
    }catch(err){
        console.log(err)
    }
    
}