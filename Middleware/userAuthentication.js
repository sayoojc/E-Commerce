const userModel = require("../models/userModel");

exports.forceLogout = async(req,res,next) => {
    try {
        if(req.session.user){
            const user = await userModel.findOne({email:req.session.user});
            if(user.isBlocked===true){
                delete req.session.user;
               return  res.redirect('/getLogin');
                
            }else{
                next();
            }
        }else{
            res.redirect('/getLogin');
        }
    } catch (error) {
        console.log(error.message)
    }
};

