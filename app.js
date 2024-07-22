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
 const wishlist = require('./routes/userRoutes/wishlist.js');
 const wallet = require('./routes/userRoutes/wallet.js');
 const salesReport = require('./routes/adminRoutes/salesReport.js');
 const coupons = require('./routes/adminRoutes/coupon.js');
 const userCoupons = require('./routes/userRoutes/coupon.js');
 const orderManagement = require('./routes/adminRoutes/orderManagement.js')
 const nocache = require("nocache");
 const flash=require("connect-flash");
 const passportSetup = require('./config/googleAuth.js');
 const passport = require('passport');
 const errorHandler = require('./Middleware/errorHandler.js'); 
 const http = require('http');
 const {Server} = require('socket.io');
 const server = http.createServer(app);
 const io = new Server(server,{
  connectionStateRecovery: {}
 });

const PORT=process.env.PORT||8080
const MONGO_URI="mongodb://localhost:27017/E-Commerce"
 



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
   
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
 app.use(nocache());
 app.use('/',user);
 app.use("/",profile);
 app.use('/',cart);
 app.use('/',wishlist);
 app.use('/',wallet);
 app.use('/',userCoupons);

 app.use('/admin',salesReport);
 app.use("/admin",admin);
  app.use ("/admin",category);
 app.use("/admin",product);
 app.use("/admin",account);
 app.use("/admin",order);
 app.use("/admin",coupons); 
 app.use("/admin",orderManagement);

 app.put("/aiChat",(req,res,next)=>{

  async function run() {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    let details='nutromax is a gym suppliment store that sells protein powders and suppliments and you are its AI .According to the before sentence answer the next question  =>';
    const prompt =details + req.body.prompt
  
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    res.json({reply:text});
  }
  
  run();
 })



 io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use('/',errorHandler.handlerNotFound);

//  app.use(errorHandler.serverErrorHandler);


mongoose.connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on Port ${PORT}`);
      console.log('MongoDB is connected');
    });
  })
  .catch((err) => console.error(err));



