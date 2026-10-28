import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { getSlaState } from '../services/priorityService.js';
import { CIVIC_TAXONOMY } from '../services/aiClassifierService.js';
import { drainUnassignedQueueForDepartment } from '../services/dispatchService.js';

// City-wide System Metrics (Matching Appendix I: /admin/metrics)
export const getAdminMetrics = async (req, res) => {
  try {
    const allComplaints = await Complaint.find();

    const total = allComplaints.length;
    let open = 0;
    let resolved = 0;
    let critical = 0;
    let slaBreached = 0;
    let escalated = 0;
    let compliantCount = 0;

    allComplaints.forEach(c => {
      if (['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)) open++;
      if (['RESOLVED', 'CLOSED'].includes(c.status)) resolved++;
      if (c.priority === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(c.status)) critical++;
      if (c.isEscalated) escalated++;

      const sla = getSlaState(c.slaDeadline, c.status);
      if (sla === 'BREACHED') slaBreached++;
      if (sla !== 'BREACHED') compliantCount++;
    });

    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const slaCompliance = total > 0 ? ((compliantCount / total) * 100).toFixed(1) : 100;

    res.status(200).json({
      success: true,
      metrics: {
        totalComplaints: total,
        openComplaints: open,
        resolvedComplaints: resolved,
        criticalPriority: critical,
        slaBreached,
        escalatedCount: escalated,
        resolutionRate: `${resolutionRate}%`,
        slaCompliance: `${slaCompliance}%`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// City-Wide Complaints List (Matching Appendix I: /admin/complaints)
export const getCityComplaints = async (req, res) => {
  try {
    const { department, status, priority, search } = req.query;
    const filter = {};

    if (department && department !== 'ALL') filter.department = department;
    if (status && status !== 'ALL') filter.status = status;
    if (priority && priority !== 'ALL') filter.priority = priority;

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { trackingId: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
      ];
    }

    const raw = await Complaint.find(filter)
      .populate('citizen', 'name email phone')
      .populate('assignedVerifier', 'name email phone')
      .sort({ createdAt: -1 });

    const complaints = raw.map(c => {
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

// Civic Analytics Dashboard Data (Figure 5.5 in Project Report)
export const getCivicAnalytics = async (req, res) => {
  try {
    const allComplaints = await Complaint.find();

    // 1. Time-series daily volume trend (last 7-14 days)
    const daysMap = {};
    const today = new Date();
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { date: key, total: 0, critical: 0, resolved: 0 };
    }

    allComplaints.forEach(c => {
      const dayKey = new Date(c.createdAt).toISOString().split('T')[0];
      if (daysMap[dayKey]) {
        daysMap[dayKey].total += 1;
        if (c.priority === 'CRITICAL') daysMap[dayKey].critical += 1;
        if (['RESOLVED', 'CLOSED'].includes(c.status)) daysMap[dayKey].resolved += 1;
      }
    });

    const timeSeriesData = Object.values(daysMap);

    // 2. Top Main Categories Distribution (matching Report Figure 5.5 bar chart)
    const categoryCounts = {};
    Object.keys(CIVIC_TAXONOMY).forEach(cat => {
      categoryCounts[cat] = 0;
    });

    allComplaints.forEach(c => {
      const cat = c.mainCategory || 'Roads & Infrastructure';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoriesChart = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // 3. Department Performance and Workload Matrix
    const deptWorkloads = {};
    const knownDepts = [
      'Roads & Infrastructure',
      'Streetlights & Electricity',
      'Waste Management & Sanitation',
      'Water Supply',
      'Public Safety & Other Civic Hazards',
    ];

    knownDepts.forEach(d => {
      deptWorkloads[d] = {
        name: d,
        total: 0,
        open: 0,
        resolved: 0,
        breached: 0,
        compliancePct: 100,
      };
    });

    allComplaints.forEach(c => {
      const d = c.department || 'Roads & Infrastructure';
      if (!deptWorkloads[d]) {
        deptWorkloads[d] = { name: d, total: 0, open: 0, resolved: 0, breached: 0, compliancePct: 100 };
      }
      deptWorkloads[d].total += 1;
      if (['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)) {
        deptWorkloads[d].open += 1;
      }
      if (['RESOLVED', 'CLOSED'].includes(c.status)) {
        deptWorkloads[d].resolved += 1;
      }
      const sla = getSlaState(c.slaDeadline, c.status);
      if (sla === 'BREACHED') {
        deptWorkloads[d].breached += 1;
      }
    });

    Object.values(deptWorkloads).forEach(item => {
      if (item.total > 0) {
        const compliant = item.total - item.breached;
        item.compliancePct = Math.round((compliant / item.total) * 100);
      }
    });

    res.status(200).json({
      success: true,
      timeSeriesData,
      categoriesChart,
      workloadMatrix: Object.values(deptWorkloads),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reassign Priority (Super Admin privilege)
export const reassignPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPriority, reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldPriority = complaint.priority;
    complaint.priority = newPriority;

    complaint.statusHistory.push({
      status: complaint.status,
      note: `Priority reassigned from ${oldPriority} to ${newPriority} by Super Admin. Reason: ${reason || 'Administrative review'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'admin',
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Priority updated to ${newPriority}`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Classification Review & Manual Correction Workflow
export const correctAiClassification = async (req, res) => {
  try {
    const { id } = req.params;
    const { correctedCategory, correctedSubcategory, notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldCat = complaint.mainCategory;
    complaint.mainCategory = correctedCategory;
    if (correctedSubcategory) complaint.subcategory = correctedSubcategory;
    
    // Update department based on new category
    const newDept = CIVIC_TAXONOMY[correctedCategory]?.department || complaint.department;
    complaint.department = newDept;

    complaint.aiClassification.reviewedByAdmin = true;

    complaint.statusHistory.push({
      status: complaint.status,
      note: `Category corrected from "${oldCat}" to "${correctedCategory}" (${newDept}) by Admin. ${notes || ''}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'admin',
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Classification successfully updated and routed to ${newDept}`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User and Staff Management (Super Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Department Head or Field Verifier (Super Admin)
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, department, designation } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, role, and department are required.',
      });
    }

    if (!['dept_head', 'verifier', 'admin', 'citizen'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${email} already exists.`,
      });
    }

    const defaultDesignation =
      designation ||
      (role === 'dept_head'
        ? `${department} - Department Head`
        : role === 'verifier'
        ? `${department} - Field Verifier`
        : 'Municipal Officer');

    const newUser = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role,
      department,
      designation: defaultDesignation,
    });

    // Autonomous Queue Draining: If a new verifier was registered, immediately
    // dispatch any waiting complaints in their department.
    if (role === 'verifier') {
      drainUnassignedQueueForDepartment(department).catch(err =>
        console.error('[Auto-Drain Trigger Error]', err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: `${role === 'dept_head' ? 'Department Head' : 'Field Verifier'} created successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
