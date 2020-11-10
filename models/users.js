const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  wfrom: {
    type: String,
  },
  wexp: {
    type: String,
  },
  affid: { type: Number },
  role: { type: String },
  balance: { type: Number },
  leadsCompleted: { type: String },
  prefpayment: { type: String },
  createdAt: {
    type: Date,
    default: Date.now()
  }

});
module.exports = mongoose.model('Users', userSchema);        