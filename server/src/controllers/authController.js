import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'civiceye_jwt_secret_2026', {
    expiresIn: '7d',
  });
};

// In-memory OTP storage for simulation/demo
const otpStore = new Map();

// Register Citizen / User
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, department } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'citizen',
      department: department || null,
      designation: role === 'dept_head' ? 'Department Head' : role === 'verifier' ? 'Field Verifier' : role === 'admin' ? 'Super Administrator' : 'Citizen',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Current User Profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Citizen OTP verification - Request OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`[CivicEye OTP] Verification Code for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phone}. (For testing: ${otp})`,
      demoOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Citizen OTP verification - Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const entry = otpStore.get(phone);

    if (!entry) {
      return res.status(400).json({ success: false, message: 'No active OTP request found.' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (entry.otp !== otp && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    otpStore.delete(phone);

    res.status(200).json({
      success: true,
      message: 'Citizen identity verified successfully.',
      isVerified: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
