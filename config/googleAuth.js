const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/userModel');


passport.serializeUser((user,done)=>{
  done(null,user.id)
});
passport.deserializeUser((id,done)=>{
  User.findById(id).then((user)=>{
      done(null,user)
  })
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://nutromax.shop/auth/google/redirect"
  },
  async function(accessToken, refreshToken, profile, cb) {
    const userEmail = profile.emails[0].value;
    const name=profile.displayName
    const googleId=profile.id
    try {   
      let user = await User.findOne({ email: userEmail });
      if (!user) {
             /////////////////function to generate the refferal code/////////////
             function generateReferralCode(userId) {
              // Remove spaces from userId and convert to uppercase
              const cleanedUserId = userId.replace(/\s+/g, '').toUpperCase();
              const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
              return `${cleanedUserId}-${randomString}`;
            }
            
            

      const referralCode = generateReferralCode(name);
        user=await User.create({
          googleId: googleId,
          name: name,
          email: userEmail,
          referralCode:referralCode
        });
      }
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  }
));







