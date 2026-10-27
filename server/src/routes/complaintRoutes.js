import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  trackComplaint,
  getNearbyComplaints,
  getComplaintById,
  checkDuplicateLive,
  classifyPreview,
  confirmResolution,
  reopenComplaint,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/auth.js';
import { uploadEvidence } from '../middleware/upload.js';

const router = express.Router();

// Public / Semi-public endpoints
router.get('/track/:trackingId', trackComplaint);
router.get('/nearby', getNearbyComplaints);
router.post('/check-duplicate', checkDuplicateLive);
router.post('/classify-preview', classifyPreview);

// Protected Citizen / General Endpoints
router.post('/', protect, uploadEvidence.single('image'), createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.post('/:id/confirm-resolution', protect, confirmResolution);
router.post('/:id/reopen', protect, reopenComplaint);

export default router;
