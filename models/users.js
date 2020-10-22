const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      role: {type: String},

      createdAt: {
        type: Date,
        default: Date.now()
      }

});
module.exports = mongoose.model('Users',userSchema);        