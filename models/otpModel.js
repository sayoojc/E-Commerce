const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60,  // The document will be removed 60 seconds after its creation
  },
});


module.exports = mongoose.model("OTP", otpSchema);
