const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'muqeetai_supersecret_key_2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdulmuqeetkb2006_db_user:v3W2ML3ZHCO1VAdw@cluster0.1h6z8kx.mongodb.net/muqeetai?retryWrites=true&w=majority';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Demo@1234';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeAdmin();
  })
  .catch(err => console.error('MongoDB error:', err));

async function initializeAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: ADMIN_USERNAME });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const admin = new Admin({ username: ADMIN_USERNAME, password: hashedPassword });
      await admin.save();
      console.log(`Admin initialized: ${ADMIN_USERNAME}`);
    }
  } catch (error) {
    console.error('Admin init error:', error);
  }
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  utrNumber: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/user/payment-status', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      userId: req.user.userId,
      status: 'verified'
    });
    res.json({ hasVerifiedPayment: !!payment, payment });
  } catch (error) {
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

app.post('/api/payment', verifyToken, async (req, res) => {
  try {
    const { plan, amount, transactionId, utrNumber, name, email } = req.body;
    const payment = new Payment({
      userId: req.user.userId,
      name,
      email,
      plan,
      amount,
      transactionId,
      utrNumber
    });
    await payment.save();
    res.status(201).json({ message: 'Payment submitted successfully. Verification pending.', paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting payment' });
  }
});

app.get('/api/payment/status/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ status: payment.status, payment });
  } catch (error) {
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Admin.findOne({ username: 'admin' });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }
    const adminToken = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ adminToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/payments/all', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

app.post('/api/admin/verify-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findByIdAndUpdate(paymentId, { status: 'verified' }, { new: true });
    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

app.post('/api/admin/reject-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findByIdAndUpdate(paymentId, { status: 'rejected' }, { new: true });
    res.json({ message: 'Payment rejected', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
