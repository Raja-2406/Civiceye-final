import express from 'express';
import { getAssignedComplaints, submitInspection } from '../controllers/verifierController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadEvidence } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('verifier', 'admin'));

router.get('/assigned', getAssignedComplaints);
router.post('/inspect/:id', uploadEvidence.single('proofImage'), submitInspection);

export default router;
