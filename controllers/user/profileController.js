const addressModel = require('../../models/addressModel');
const userModel = require('../../models/userModel');
const categoryModel = require('../../models/categoryModel');
const cartModel = require('../../models/cartModel');
const bcrypt = require('bcrypt');

exports.getProfile =  async(req,res,next) => {
  try {
    const email = req.session.user;

    const category = await categoryModel.find();
  
    const user = await userModel.findOne({email:email});
    const userId = user._id;
    const referralLink = `http://localhost:3001/getSignup/${user.referralCode}`;
    const cart = await cartModel.findOne({userId});
    if(cart){
      productNumber = cart.items.length;
    }else{
      productNumber = 0;
    }
    
    console.log('user from the getProfile',user);
    const id = user._id;
    console.log(id);
    const addresses = await addressModel.find({user:id});
    res.render('user/profile',{data:addresses,user,category,productNumber,referralLink});
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
}


exports.postAddress = async (req, res,next) => {
  try {
      const email = req.session.user;
      const user = await userModel.findOne({ email: email });


      const { name, address1, address2, phone, locality, city, pincode, state, } = req.body;
      const existingAddresses = await addressModel.find({user:user._id});
      console.log('The existing addresses are:',existingAddresses);

      if(existingAddresses.length>0){
        const newAddress = new addressModel({
          user: user._id,
          name,
          address1,
          address2,
          phone,
          locality,
          pincode,
          city,
          state
      });

      await newAddress.save();
      } else{
        const newAddress = new addressModel({
          user: user._id,
          name,
          address1,
          address2,
          phone,
          locality,
          pincode,
          city,
          state,
          default:true
      });

      await newAddress.save(); 
      }



      return res.status(201).json({ message: 'Address added successfully' });
  } catch (error) {
    console.error('Error in postAddress:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


exports.editAdress = async(req,res,next) => {
try {
  const { name, address1, address2, phone, locality, city, pincode, state,addressId } = req.body;
  console.log(req.body);
  console.log('The id of the address to be edited',addressId);
const address = await addressModel.findById(addressId);
console.log('The address from the edit address backend function',address);
address.name = name;
address.address1 = address1;
address.address2 = address2;
address.phone = phone;
address.locality = locality;
address.pincode = pincode;
address.state = state;
address.city = city;

await address.save();
return res.status(200).json({ message: 'Address edited successfully' });
} catch (error) {
  console.error('Error in editAdress:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
}
}


exports.deleteAddress = async(req,res,next) => {
  try {
    
    const deletedAddress = await addressModel.findByIdAndDelete(req.params.addressId);

    if (!deletedAddress) {
        return res.status(404).json({ message: 'Address not found' });
    }
    res.status(204).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
}


exports.changePassword = async(req,res,next) => {
  try {
    const {currentPassword,newPassword} = req.body;

    const email = req.session.user;

    const user = await userModel.findOne({email:email});
   
   
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('change password match',passwordMatch);
    if(passwordMatch){
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
    
      user.password = hashedPassword;
      await user.save();
      console.log(req.session.user);
      return res.status(201).json({ message: 'Password changed successfully' });
    }

  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
}

exports.changeName = async(req,res,next) => {
try {
  const newName = req.body.newName;
const email = req.session.user;
if (!newName) {
  return res.status(400).json({ errorMessage: 'No name in the new name field' });
}
if (!email) {
  return res.status(400).json({ errorMessage: 'No user logged in' });
}
const user = await userModel.findOne({email:email});
if (!user) {
  return res.status(404).json({ errorMessage: 'User not found' });
}
user.name = newName;
await user.save();
return res.status(200).json({ message: 'Name changed successfully' });

} catch (error) {
  console.error('Error in changeName:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
}

}