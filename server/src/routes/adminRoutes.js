import express from 'express';
import {
  getAdminMetrics,
  getCityComplaints,
  getCivicAnalytics,
  reassignPriority,
  correctAiClassification,
  getAllUsers,
  createStaffUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'dept_head')); // Dept heads can view analytics as seen in Figure 5.5

router.get('/metrics', getAdminMetrics);
router.get('/complaints', getCityComplaints);
router.get('/analytics', getCivicAnalytics);

// Admin-only management endpoints
router.patch('/reassign-priority/:id', authorize('admin'), reassignPriority);
router.patch('/correct-category/:id', authorize('admin'), correctAiClassification);
router.get('/users', authorize('admin'), getAllUsers);
router.post('/users', authorize('admin'), createStaffUser);
router.delete('/users/:id', authorize('admin'), deleteUser);

export default router;
