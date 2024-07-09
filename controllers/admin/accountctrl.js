const userModel = require('../../models/userModel');
const errorHandler = require('../../Middleware/errorHandler');


/////////////Get admin user page ////////////

exports.getUserDetail = async (req, res, next) => {
    try {
      if (req.session.admin) {
        const { page = 1, limit = 10, search = '' } = req.query;
  
        const query = search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
              ],
            }
          : {};
  
        const userCount = await userModel.countDocuments(query);
        const userDetail = await userModel
          .find(query)
          .skip((page - 1) * limit)
          .limit(parseInt(limit, 10));
  
        res.render('user/accounts', {
          userDetail,
          totalPages: Math.ceil(userCount / limit),
          currentPage: parseInt(page, 10),
          search,
        });
  
        console.log('The req.session.admin:', req.session.admin);
      } else {
        res.redirect('/adminLogin');
      }
    } catch (error) {
      console.error('Error in getUserDetail:', error);
      res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
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
        console.error('Error in postblockUnblockUser:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}




