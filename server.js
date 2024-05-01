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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(500).send('Error registering new user');
  }
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).send('User not found');
  }
  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (isValid) {
    jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if (err) {
        return res.sendStatus(500);
      }
      res.json({ token });
    });
  } else {
    res.status(401).send('Not authorized');
  }
});

app.post('/transaction', verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const transaction = new Transaction({
        userId: authData.user._id,
        ...req.body,
      });
      try {
        await transaction.save();
        res.json({ message: 'Transaction added', transaction });
      } catch (error) {
        res.status(500).send('Error saving transaction');
      }
    }
  });
});

app.get('/transactions', verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const transactions = await Transaction.find({ userId: authData.user._id });
        res.json(transactions);
      } catch (error) {
        res.status(500).send('Error retrieving transactions');
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});