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

TransactionSchema.statics.createTransaction = async function (transactionDetails) {
  try {
    const newTransaction = await this.create(transactionDetails);
    return newTransaction;
  } catch (error) {
    handleError(error);
  }
};

TransactionSchema.statics.removeTransactionById = async function (transactionId) {
  try {
    const deletionResult = await this.deleteOne({ _id: transactionId });
    if (deletionResult.deletedCount === 0) {
      throw new Error(`Transaction with ID ${transactionId} not found.`);
    }
    return deletionResult;
  } catch (error) {
    handleError(error);
  }
};

TransactionSchema.statics.modifyTransaction = async function (transactionId, updatedDetails) {
  try {
    const updatedTransaction = await this.findByIdAndUpdate(transactionId, updatedDetails, { new: true });
    if (!updatedTransaction) {
      throw new Error(`Transaction with ID ${transactionId} not found or could not be updated.`);
    }
    return updatedTransaction;
  } catch (error) {
    handleError(error);
  }
};

function handleError(error) {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    throw new Error(`Validation Error: ${messages.join('. ')}`);
  } else if (error.name === 'CastError') {
    throw new Error(`Invalid ID format: ${error.value}`);
  } else {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel;