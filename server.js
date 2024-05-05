require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

function splitAuthorizationHeader(header) {
  return header.split(' ')[1];
}

function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  if (authorizationHeader) {
    const token = splitAuthorizationHeader(authorizationHeader);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.post('/register', async (req, res) => {
  try {
    const encryptedPassword = await bcrypt.hash(req.body.password, 8);
    await registerUser(req.body.username, encryptedPassword);
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('User registration failed');
  }
});

async function registerUser(username, encryptedPassword){
    const newUser = new User({ username, password: encryptedPassword });
    await newUser.save();
}

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('User not found');
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect) return res.status(401).send('Login not authorized');
    const token = jwt.sign({ user: { _id: user._id } }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch(error) {
    res.sendStatus(500);
  }
});

app.post('/transaction', authenticateToken, async (req, res) => {
  try {
    const newTransaction = await createTransaction(req.user._id, req.body);
    res.json({ message: 'Transaction created successfully', transaction: newTransaction });
  } catch (error) {
    res.status(500).send('Failed to save transaction');
  }
});

async function createTransaction(userId, transactionData) {
  const newTransaction = new Transaction({ userId, ...transactionData });
  await newTransaction.save();
  return newTransaction;
}

app.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userTransactions = await Transaction.find({ userId: req.user._id });
    res.json(userTransactions);
  } catch (error) {
    res.status(500).send('Failed to retrieve transactions');
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Unexpected server error');
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});