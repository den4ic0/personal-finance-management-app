const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Ensure environment variables are read

// Define User Schema
const userSchema = new mongoose.Schema({
  // Username must be unique and is required
  username: {
    type: String,
    required: true,
    unique: true
  },
  // Email must be unique and is required
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Password hash is stored, not the plaintext password
  passwordHash: {
    type: String,
    required: true
  },
  // Reference to transaction IDs, establishing a relation with the 'Transaction' model
  transactionIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
}, { timestamps: true }); // Enable automatic creation of createdAt and updatedAt timestamps

/**
 * Hashes the user's password.
 *
 * @param {string} password - The plaintext password to hash.
 */
userSchema.methods.setPassword = async function(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;  // Get the number of salt rounds from .env or use default
  this.passwordHash = await bcrypt.hash(password, saltRounds);
}

/**
 * Validates a given password against the stored hash.
 *
 * @param {string} password - The plaintext password to validate.
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating if the password is valid.
 */
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
}

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;