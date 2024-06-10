const userModel = require('../../models/userModel');


/////////////Get admin user page ////////////

exports.getUserDetail = async(req,res) =>{
    try {
        const userDetail = await userModel.find();
        res.render("user/accounts",{userDetail});
    } catch (error) {
        res.status(500).send('internal server error');
    }
};




//////////////user block unblock/////////////

exports.postblockUnblockUser = async(req,res) => {
    try {
        console.log('postblockUnblock category hits');
       const userId = req.body.id
       console.log(`The user id from the front end is${userId}`);
       const user = await userModel.findById(userId) ;
       console.log(user);
       if(user.isBlocked===true){
        user.isBlocked=false;
           await user.save();
       }else{
        user.isBlocked = true;
        await user.save();
       }
       res.status(201).json({message:'success'});
    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error')
    }
}




