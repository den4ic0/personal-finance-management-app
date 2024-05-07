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

function extractTokenFromHeader(header) {
  return header.split(' ')[1];
}

function verifyAuthentication(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err) return res.sendStatus(403); // Forbidden
      req.user = decodedUser;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
}

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    await saveNewUser(req.body.username, hashedPassword);
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('User registration failed');
  }
});

async function saveNewUser(username, hashedPassword){
    const user = new User({ username, password: hashedPassword });
    await user.save();
}

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('User not found');
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) return res.status(401).send('Login not authorized');
    const authToken = jwt.sign({ user: { _id: user._id } }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token: authToken });
  } catch(error) {
    res.sendStatus(500);
  }
});

app.post('/transaction', verifyAuthentication, async (req, res) => {
  try {
    const transaction = await recordNewTransaction(req.user._id, req.body);
    res.json({ message: 'Transaction created successfully', transaction: transaction });
  } catch (error) {
    res.status(500).send('Failed to save transaction');
  }
});

async function recordNewTransaction(userId, transactionData) {
  const transaction = new Transaction({ userId, ...transactionData });
  await transaction.save();
  return transaction;
}

app.get('/transactions', verifyAuthentication, async (req, res) => {
  try {
    const transactionsOfUser = await Transaction.find({ userId: req.user._id });
    res.json(transactionsOfUser);
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