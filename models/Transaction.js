const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Transaction date is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
  }
});

TransactionSchema.statics.createTransaction = async function(transactionDetails) {
  try {
    const newTransaction = await this.create(transactionDetails);
    return newTransaction;
  } catch(error) {
    throw error;
  }
};

TransactionSchema.statics.removeTransactionById = async function(transactionId) {
  try {
    const deletionResult = await this.deleteOne({ _id: transactionId });
    return deletionResult;
  } catch(error) {
    throw error;
  }
};

TransactionSchema.statics.modifyTransaction = async function(transactionId, updatedDetails) {
  try {
    const updatedTransaction = await this.findByIdAndUpdate(transactionId, updatedDetails, { new: true });
    return updatedTransaction;
  } catch(error) {
    throw error;
  }
};

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel;