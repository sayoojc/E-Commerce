const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profileController');
const userAuthentication = require('../../Middleware/userAuthentication');

////get routes////

router.get('/getProfile',userAuthentication.forceLogout,profileController.getProfile);


////post routes////
 router.post('/postAddress',profileController.postAddress);


 ///////put routes///////
router.put('/editAddress',profileController.editAdress);
router.put('/changePassword',profileController.changePassword);
router.put('/changeName',profileController.changeName);

///////Delete address////////////
router.delete('/deleteAddress/:addressId',profileController.deleteAddress);

module.exports = router;