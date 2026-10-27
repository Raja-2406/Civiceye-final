import express from 'express';
import {
  getDepartmentQueue,
  getDepartmentStaff,
  assignVerifier,
  updateComplaintStatus,
  autoDispatchDepartmentQueue,
  verifyAndCloseComplaint,
} from '../controllers/departmentController.js';
import { protect, authorize, departmentScope } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('dept_head', 'admin'));
router.use(departmentScope);

router.get('/queue', getDepartmentQueue);
router.get('/staff', getDepartmentStaff);
router.post('/assign-verifier', assignVerifier);
router.post('/auto-dispatch', autoDispatchDepartmentQueue);
router.post('/verify-and-close/:id', verifyAndCloseComplaint);
router.patch('/status/:id', updateComplaintStatus);

export default router;
