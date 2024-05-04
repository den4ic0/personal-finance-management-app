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

const verifyTokenMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  if (typeof authorizationHeader !== 'undefined') {
    const token = authorizationHeader.split(' ')[1];
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
  }
};

app.post('/register', async (req, res) => {
  try {
    const encryptedPassword = await bcrypt.hash(req.body.password, 8);
    const newUser = new User({
      username: req.body.username,
      password: encryptedPassword,
    });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('User registration failed');
  }
});

app.post('/login', async (req, res) => {
  const userAttemptingLogin = await User.findOne({ username: req.body.username });
  if (!userAttemptingLogin) {
    return res.status(400).send('User not found');
  }
  const isPasswordCorrect = await bcrypt.compare(req.body.password, userAttemptingLogin.password);
  if (isPasswordCorrect) {
    jwt.sign({ user: userAttemptingLogin }, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if (err) {
        return res.sendStatus(500);
      }
      res.json({ token: token });
    });
  } else {
    res.status(401).send('Login not authorized');
  }
});

app.post('/transaction', verifyTokenMiddleware, async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authorizedData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const newTransaction = new Transaction({
        userId: authorizedData.user._id,
        ...req.body,
      });
      try {
        await newTransaction.save();
        res.json({ message: 'Transaction created successfully', transaction: newTransaction });
      } catch (error) {
        res.status(500).send('Failed to save transaction');
      }
    }
  });
});

app.get('/transactions', verifyTokenMiddleware, async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authorizedData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const userTransactions = await Transaction.find({ userId: authorizedData.user._id });
        res.json(userTransactions);
      } catch (error) {
        res.status(500).send('Failed to retrieve transactions');
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Unexpected server error');
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});