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
  this.logActivity('Set password');
}

userSchema.methods.validatePassword = async function(password) {
  const isValid = await bcrypt.compare(password, this.passwordHash);
  this.logActivity(isValid ? 'Validated password successfully' : 'Failed password validation');
  return isValid;
}

userSchema.methods.logActivity = function(message) {
  console.log(`[User Activity]: ${message} for user ${this.username} at ${(new Date()).toISOString()}`);
}

const User = mongoose.model('User', userSchema);
module.exports = User;