const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Load environment variables

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  transactionIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Method to hash a password
userSchema.methods.setPassword = async function(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10; // Use env variable or default
  this.passwordHash = await bcrypt.hash(password, saltRounds);
}

// Method to check if the provided password matches the hash
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
}

// Compile model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;