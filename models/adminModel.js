const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
      },
      password: {
        type: Number,
      },
    
});


const Admin = mongoose.model("Admin",adminSchema);

module.exports = Admin;