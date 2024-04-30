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
    required: [true, 'Date is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
  }
});

TransactionSchema.statics.addTransaction = async function(transactionData) {
  try {
    const transaction = await this.create(transactionData);
    return transaction;
  } catch(error) {
    throw error;
  }
};

TransactionSchema.statics.deleteTransaction = async function(transactionId) {
  try {
    const result = await this.deleteOne({ _id: transactionId });
    return result;
  } catch(error) {
    throw error;
  }
};

TransactionSchema.statics.updateTransaction = async function(transactionId, updateData) {
  try {
    const result = await this.findByIdAndUpdate(transactionId, updateData, { new: true });
    return result;
  } catch(error) {
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;