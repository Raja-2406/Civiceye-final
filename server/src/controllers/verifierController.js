import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getSlaState } from '../services/priorityService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// Get Complaints Assigned to the Logged-In Verifier
export const getAssignedComplaints = async (req, res) => {
  try {
    const rawComplaints = await Complaint.find({ assignedVerifier: req.user._id })
      .populate('citizen', 'name email phone')
      .sort({ createdAt: -1 });

    const complaints = rawComplaints.map(c => {
      const doc = c.toObject();
      doc.slaState = getSlaState(c.slaDeadline, c.status);
      return doc;
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verifier Inspection Progress & Report Submission
export const submitInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.assignedVerifier?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to inspect this complaint' });
    }

    // Strict Workflow Order Check:
    // If complaint is in ASSIGNED or REOPENED, it MUST move to IN_PROGRESS first before RESOLVED.
    const requestedStatus = status || 'IN_PROGRESS';

    if (['ASSIGNED', 'REOPENED'].includes(complaint.status)) {
      if (requestedStatus === 'RESOLVED') {
        return res.status(400).json({
          success: false,
          message: 'Workflow Order Restriction: You cannot jump directly from Assigned to Resolved. Please move the task to IN_PROGRESS first before submitting final resolution.',
        });
      }
    }

    // Handle proof image upload (Cloudinary)
    let proofImageUrl = complaint.verificationReport?.proofImageUrl || '';
    if (req.file) {
      const cloudResult = await uploadToCloudinary(req.file.path, 'civiceye_verification_proofs');
      if (cloudResult) {
        proofImageUrl = cloudResult.url;
      } else {
        proofImageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const nextStatus = requestedStatus;
    complaint.status = nextStatus;

    complaint.verificationReport = {
      verifierId: req.user._id,
      verifierName: req.user.name,
      notes: notes || (nextStatus === 'IN_PROGRESS' ? 'Field inspection commenced on site.' : 'Field verification completed and verified on site.'),
      proofImageUrl,
      completedAt: nextStatus === 'RESOLVED' ? new Date() : complaint.verificationReport?.completedAt,
    };

    complaint.statusHistory.push({
      status: nextStatus,
      note: `Field update by ${req.user.name} (${nextStatus}): ${notes || (nextStatus === 'IN_PROGRESS' ? 'Site inspection started.' : 'Inspection completed.')}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'verifier',
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Department Head
    const deptHead = await User.findOne({ role: 'dept_head', department: complaint.department });
    if (deptHead) {
      await Notification.create({
        recipient: deptHead._id,
        title: `Verification Report: #${complaint.trackingId}`,
        message: `Verifier ${req.user.name} submitted inspection findings. Status changed to ${nextStatus}.`,
        type: 'STATUS_CHANGE',
        complaintId: complaint._id,
        trackingId: complaint.trackingId,
      });
    }

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: `Field Inspection Update: #${complaint.trackingId}`,
      message: `Your reported civic issue has been inspected by verifier ${req.user.name}. Status: ${nextStatus}.`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    res.status(200).json({
      success: true,
      message: 'Field verification recorded successfully.',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
