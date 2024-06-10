const passport = require('passport');

exports.authStageOne = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.authStageTwo = [
  passport.authenticate('google', { failureRedirect: '/getLogin' }),
  function(req, res) {
    req.session.user = req.user.email;
    console.log('The req.session.user in the getGoogle function is', req.session.user);
    res.redirect('/getHome');
  }
];