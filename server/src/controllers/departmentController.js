import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getSlaState } from '../services/priorityService.js';
import { autoAssignComplaint } from '../services/dispatchService.js';

// Get Department Head Operations Queue & KPIs
export const getDepartmentQueue = async (req, res) => {
  try {
    const departmentName = req.scopedDepartment || req.query.department;

    if (!departmentName) {
      return res.status(400).json({ success: false, message: 'Department scope missing' });
    }

    const {
      tab = 'all', // 'all', 'unassigned', 'assigned'
      status,
      slaStatus,
      priority,
      isEscalated,
      search,
    } = req.query;

    const filter = { department: departmentName };

    // Queue tab filtering
    if (tab === 'unassigned') {
      filter.assignedVerifier = null;
      filter.status = { $ne: 'CLOSED' };
    } else if (tab === 'assigned') {
      filter.assignedVerifier = { $ne: null };
      filter.status = { $ne: 'CLOSED' };
    }

    // Status filter
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      filter.priority = priority;
    }

    // Escalation filter
    if (isEscalated && isEscalated !== 'ALL') {
      filter.isEscalated = isEscalated === 'ESCALATED';
    }

    // Search query
    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { trackingId: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
        { formattedAddress: { $regex: q, $options: 'i' } },
      ];
    }

    const rawComplaints = await Complaint.find(filter)
      .populate('citizen', 'name email phone')
      .populate('assignedVerifier', 'name email phone designation')
      .sort({ createdAt: -1 });

    // Process SLA states dynamically and apply slaStatus filter if provided
    let complaints = rawComplaints.map(c => {
      const doc = c.toObject();
      doc.slaState = getSlaState(c.slaDeadline, c.status);
      return doc;
    });

    if (slaStatus && slaStatus !== 'ALL') {
      complaints = complaints.filter(c => c.slaState === slaStatus);
    }

    // Compute Department KPIs across ALL complaints of this department
    const allDeptComplaints = await Complaint.find({ department: departmentName });
    
    let totalComplaints = allDeptComplaints.length;
    let unassigned = 0;
    let critical = 0;
    let highPriority = 0;
    let dueSoon = 0;
    let slaBreached = 0;
    let resolved = 0;
    let escalated = 0;

    const now = Date.now();

    allDeptComplaints.forEach(c => {
      if (!c.assignedVerifier && !['VERIFIED_AND_CLOSED', 'CLOSED'].includes(c.status)) unassigned++;
      if (c.priority === 'CRITICAL' && !['RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED'].includes(c.status)) critical++;
      if (c.priority === 'HIGH' && !['RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED'].includes(c.status)) highPriority++;
      if (c.isEscalated) escalated++;
      if (['RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED'].includes(c.status)) resolved++;

      const sla = getSlaState(c.slaDeadline, c.status);
      if (sla === 'BREACHED') slaBreached++;
      if (sla === 'AT_RISK') dueSoon++;
    });

    const kpis = {
      totalComplaints,
      unassigned,
      critical,
      highPriority,
      dueSoon,
      slaBreached,
      resolved,
      escalated,
    };

    res.status(200).json({
      success: true,
      department: departmentName,
      kpis,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Department Verifiers / Staff (Matching Appendix I: /department/staff)
export const getDepartmentStaff = async (req, res) => {
  try {
    const departmentName = req.scopedDepartment || req.query.department;

    const staffMembers = await User.find({
      role: 'verifier',
      department: departmentName,
    }).select('name email phone designation avatar');

    res.status(200).json({
      success: true,
      count: staffMembers.length,
      staffMembers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign or Reassign Verifier
export const assignVerifier = async (req, res) => {
  try {
    const { complaintId, verifierId, note } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const verifier = await User.findById(verifierId);
    if (!verifier || verifier.role !== 'verifier') {
      return res.status(400).json({ success: false, message: 'Invalid field verifier specified' });
    }

    const isReassignment = !!complaint.assignedVerifier;
    complaint.assignedVerifier = verifier._id;
    complaint.assignedVerifierName = verifier.name;
    if (note && note.trim() !== '') {
      complaint.deptHeadInstructions = note.trim();
    }

    if (complaint.status === 'SUBMITTED' || complaint.status === 'REOPENED') {
      complaint.status = 'ASSIGNED';
    }

    complaint.statusHistory.push({
      status: complaint.status,
      note: note || (isReassignment 
        ? `Reassigned to field officer ${verifier.name}` 
        : `Assigned to field officer ${verifier.name} for site inspection`),
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: req.user.role,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Verifier
    await Notification.create({
      recipient: verifier._id,
      title: 'New Complaint Assignment',
      message: `You have been assigned to inspect incident #${complaint.trackingId} (${complaint.title}) at ${complaint.formattedAddress}.`,
      type: 'ASSIGNMENT',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: 'Complaint Assigned for Inspection',
      message: `Your complaint #${complaint.trackingId} has been assigned to verifier ${verifier.name} from the ${complaint.department} department.`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    res.status(200).json({
      success: true,
      message: `Complaint successfully ${isReassignment ? 'reassigned' : 'assigned'} to ${verifier.name}.`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Official Complaint Status (Department Head)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note, isEscalated } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (typeof isEscalated === 'boolean') complaint.isEscalated = isEscalated;

    complaint.statusHistory.push({
      status: complaint.status,
      note: note || `Status updated to ${complaint.status} by ${req.user.name}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: req.user.role,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: `Status Update: ${complaint.status}`,
      message: `Your complaint #${complaint.trackingId} is now marked as ${complaint.status}. Note: ${note || 'Status updated by Department Head.'}`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${complaint.status}`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify and Close Complaint (Department Head Step)
export const verifyAndCloseComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.department !== req.user.department && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this department scope' });
    }

    complaint.status = 'VERIFIED_AND_CLOSED';
    complaint.deptHeadVerification = {
      verifiedBy: req.user._id,
      verifiedByName: req.user.name,
      remarks: remarks || 'Field verification proof inspected and confirmed against municipal standards.',
      verifiedAt: new Date(),
    };

    complaint.statusHistory.push({
      status: 'VERIFIED_AND_CLOSED',
      note: `Department Head ${req.user.name} reviewed field inspection evidence and marked issue as VERIFIED & CLOSED. Remarks: ${remarks || 'Field work verified against municipal quality standards.'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'dept_head',
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Citizen with reopening advice
    await Notification.create({
      recipient: complaint.citizen,
      title: `Grievance Verified & Closed by Department Head`,
      message: `Your complaint #${complaint.trackingId} has been verified and closed by ${req.user.name} (${complaint.department}). If the work is incomplete or the issue persists, you may reopen it.`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    res.status(200).json({
      success: true,
      message: `Complaint #${complaint.trackingId} successfully verified and closed.`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Batch Auto-Dispatch Unassigned Complaints for Department
export const autoDispatchDepartmentQueue = async (req, res) => {
  try {
    const departmentName = req.scopedDepartment || req.query.department || req.body.department;

    if (!departmentName) {
      return res.status(400).json({ success: false, message: 'Department scope required.' });
    }

    const unassignedComplaints = await Complaint.find({
      department: departmentName,
      assignedVerifier: null,
      status: { $ne: 'CLOSED' },
    });

    if (unassignedComplaints.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No unassigned complaints found in this department.',
        dispatchedCount: 0,
      });
    }

    let dispatchedCount = 0;
    for (const c of unassignedComplaints) {
      const result = await autoAssignComplaint(c);
      if (result.success) dispatchedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Successfully auto-dispatched ${dispatchedCount} of ${unassignedComplaints.length} unassigned complaints to available verifiers.`,
      dispatchedCount,
      totalUnassigned: unassignedComplaints.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
