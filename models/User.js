const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  transactionIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
}, {
  timestamps: true,
});

userSchema.methods.setPassword = async function(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
}

userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
}

const User = mongoose.model('User', userSchema);
module.exports = User;