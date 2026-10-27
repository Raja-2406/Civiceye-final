import express from 'express';
import { register, login, getMe, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
