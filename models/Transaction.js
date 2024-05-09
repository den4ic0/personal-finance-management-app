const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  transactionType: {
    type: String,
    required: [true, 'Transaction type is required'], 
    enum: ['income', 'expense']
  },
  transactionDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Transaction date is required'],
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
  }
});

TransactionSchema.statics.addNewTransaction = async function (transactionData) {
  try {
    const transaction = await this.create(transactionData);
    return transaction;
  } catch (error) {
    manageError(error);
  }
};

TransactionSchema.statics.deleteTransactionById = async function (transactionId) {
  try {
    const deleteOutcome = await this.deleteOne({ _id: transactionId });
    if (deleteOutcome.deletedCount === 0) {
      throw new Error(`Transaction with ID ${transactionId} not found.`);
    }
    return deleteOutcome;
  } catch (error) {
    manageError(error);
  }
};

TransactionSchema.statics.updateTransactionById = async function (transactionId, transactionUpdates) {
  try {
    const updatedTransactionRecord = await this.findByIdAndUpdate(transactionId, transactionUpdates, { new: true });
    if (!updatedTransactionRecord) {
      throw new Error(`Transaction with ID ${transactionId} not found or could not be updated.`);
    }
    return updatedTransactionRecord;
  } catch (error) {
    manageError(error);
  }
};

TransactionSchema.statics.calculateSpendingPerCategory = async function (userId, startPeriodDate, endPeriodDate) {
  try {
    const spendingBreakdown = await this.aggregate([
      { $match: { ownerUserId: mongoose.Types.ObjectId(userId), transactionDate: { $gte: new Date(startPeriodDate), $lte: new Date(endPeriodDate) } } },
      { $group: { _id: { transactionType: "$transactionType", category: "$category" }, totalSpent: { $sum: "$amount" } } },
      { $sort: { totalSpent: -1 } }
    ]);
    return spendingBreakdown;
  } catch (error) {
    manageError(error);
  }
};

function manageError(error) {
  console.error('Error occurred:', error);
  if (error.name === 'ValidationError') {
    const errorMessages = Object.values(error.errors).map(val => val.message);
    throw new Error(`Validation Error: ${errorMessages.join('. ')}`);
  } else if (error.name === 'CastError') {
    throw new Error(`Invalid ID format: ${error.value}`);
  } else {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;