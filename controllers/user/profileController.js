const addressModel = require('../../models/addressModel');
const userModel = require('../../models/userModel');
const bcrypt = require('bcrypt');

exports.getProfile =  async(req,res) => {
  try {
    const email = req.session.user;
  
    const user = await userModel.findOne({email:email});
    console.log('user from the getProfile',user);
    const id = user._id;
    console.log(id);
    const addresses = await addressModel.find({user:id});
    res.render('user/profile',{data:addresses,user});
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
}


exports.postAddress = async (req, res) => {
  try {
      const email = req.session.user;
      const user = await userModel.findOne({ email: email });


      const { name, address1, address2, phone, locality, city, pincode, state, } = req.body;

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

      return res.status(201).json({ message: 'Address added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: 'Internal server error' });
  }
};


exports.editAdress = async(req,res) => {
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
  console.error(error);
  res.status(500).json({ errorMessage: 'Internal server error' });
}
}


exports.deleteAddress = async(req,res) => {
  try {
    
    const deletedAddress = await addressModel.findByIdAndDelete(req.params.addressId);

    if (!deletedAddress) {
        return res.status(404).json({ message: 'Address not found' });
    }
    res.status(204).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
}


exports.changePassword = async(req,res) => {
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
    console.error(error);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
}

exports.changeName = async(req,res) => {
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
  console.error(error);
    res.status(500).json({ errorMessage: 'Internal server error' });
}

}