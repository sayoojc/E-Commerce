const express = require("express");
const app = express();
const bodyParser = require("body-parser"); 
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const mongoose =require("mongoose")
require ("dotenv").config();
const user=require("./routes/userRoutes/user.js");
 const admin=require("./routes/adminRoutes/admin.js");
 const category = require("./routes/adminRoutes/category.js");
 const product = require("./routes/adminRoutes/product.js");
 const account = require("./routes/adminRoutes/account.js");
 const profile = require('./routes/userRoutes/profile.js');
 const order = require('./routes/adminRoutes/order.js');
 const cart = require('./routes/userRoutes/cart.js');
 const nocache = require("nocache");
 const flash=require("connect-flash");
 const passportSetup = require('./config/googleAuth.js');
 const passport = require('passport');
 


const PORT=process.env.PORT||8080
const MONGO_URI="mongodb://localhost:27017/E-Commerce"
 



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));


// app.use(session({
//   secret: 'your_secret_key',
//   resave: false,
//   saveUninitialized: true,
//   store: new MemoryStore({
//     checkPeriod: 86400000 // prune expired entries every 24h
//   }),
//   cookie: { maxAge: 60000 } // 60 seconds
// }));

   

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use('/uploads',express.static(__dirname + "/uploads"));
console.log(__dirname + "/public");
app.set("view engine", "ejs");
//set view
app.set('views','./views')
app.use(passport.initialize());
app.use(passport.session());

// // /* Development Details BEGIN */
// app.use((req,res,next)=>{
//   req.session.user="sayoojcpalad@gmail.com"
//   req.session.admin="admin@gmail.com"
//   next();
// })
// // /* Development Details END */

 app.use("/",nocache(),user);
 app.use("/",profile);
 app.use('/',cart);
 app.use("/admin",admin);
 app.use ("/admin",category);
 app.use("/admin",product);
 app.use("/admin",account);
 app.use("/admin",order);

 app.use('/',(req,res) => {
  res.render('user/404');
 });



mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on Port ${PORT}`);
      console.log('MongoDB is connected');
    });
  })
  .catch((err) => console.error(err));



