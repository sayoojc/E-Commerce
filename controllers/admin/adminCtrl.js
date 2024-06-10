const adminModel = require('../../models/adminModel');
const { render } = require('ejs');



//Get Controll

exports.getAdminLogin = (req,res) => {
  res.render("user/adminLogin", { error: '' });
};

exports.getAdminDashboard = (req,res) => {
  if(req.session.admin){
    res.render("user/adminDashboard");
  }else{
    res.redirect('/admin/adminLogin');
  }
  
}

///post controll//

exports.postAdminLogin =  (req,res) => {
 const email = req.body.email;
 const password = req.body.password;
 let email1=process.env.admin_email
 let password1=process.env.admin_pass

 if(email === email1 && password1 === password){
  req.session.admin = email;
     res.redirect("Dashboard")
 }else {
  res.redirect('adminLogin');
 }
};

exports.postAdminLogout = (req,res) => {
  req.session.destroy((err) => {
    if(err){
      console.log('error loging out admin');
      res.send('Error');
    }else{
      res.redirect("adminLogin");
    }
  });
  
};


























