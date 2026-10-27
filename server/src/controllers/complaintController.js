import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { classifyCivicIssue, CIVIC_TAXONOMY } from '../services/aiClassifierService.js';
import { calculateDeterministicPriority, getSlaState } from '../services/priorityService.js';
import { checkDuplicateComplaint } from '../services/duplicateService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { autoAssignComplaint } from '../services/dispatchService.js';

// Generate unique tracking ID: #CMP followed by 8 random digits
const generateTrackingId = async () => {
  let isUnique = false;
  let trackingId = '';
  while (!isUnique) {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    trackingId = `#CMP${randomDigits}`;
    const exists = await Complaint.findOne({ trackingId });
    if (!exists) isUnique = true;
  }
  return trackingId;
};

// Real-time pre-check for duplicates (10m radius + semantic similarity)
export const checkDuplicateLive = async (req, res) => {
  try {
    const { title, description, latitude, longitude, mainCategory, excludeId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Coordinates are required for duplicate analysis.' });
    }

    const result = await checkDuplicateComplaint({
      title: title || '',
      description: description || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mainCategory: mainCategory || 'Roads & Infrastructure',
      excludeId: excludeId || null,
      radiusMeters: 10,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Classification Preview
export const classifyPreview = async (req, res) => {
  try {
    const { title, description } = req.body;
    const aiResult = await classifyCivicIssue(title, description);
    res.status(200).json({ success: true, aiResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit New Complaint
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      mainCategory,
      subcategory,
      latitude,
      longitude,
      formattedAddress,
      locality,
      city,
      pincode,
      gpsAccuracy,
      urgency,
      safetyRisk,
      publicImpact,
      duplicateWarningDismissed,
    } = req.body;

    if (!title || !description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location coordinates are required.',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. AI-assisted Classification & Severity estimation
    const aiAnalysis = await classifyCivicIssue(title, description);

    // Selected or AI category
    const finalCategory = mainCategory || aiAnalysis.predictedCategory;
    const finalSubcategory = subcategory || aiAnalysis.predictedSubcategory;
    const assignedDepartment = CIVIC_TAXONOMY[finalCategory]?.department || 'Roads & Infrastructure';

    // 2. Deterministic Priority & SLA calculation
    const priorityData = calculateDeterministicPriority({
      severity: aiAnalysis.predictedSeverity || 'MEDIUM',
      urgency: urgency || 'MEDIUM',
      safetyRisk: safetyRisk || 'MEDIUM',
      publicImpact: publicImpact || 'MEDIUM',
    });

    // 3. Duplicate check check
    const duplicateData = await checkDuplicateComplaint({
      title,
      description,
      latitude: lat,
      longitude: lng,
      mainCategory: finalCategory,
      radiusMeters: 10,
    });

    // 4. Handle Uploaded Image Evidence (Cloudinary Cloud Storage)
    let imageUrl = '';
    let publicId = '';
    if (req.file) {
      const cloudResult = await uploadToCloudinary(req.file.path, 'civiceye_complaints');
      if (cloudResult) {
        imageUrl = cloudResult.url;
        publicId = cloudResult.publicId;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
        publicId = req.file.filename;
      }
    }

    // 5. Generate tracking ID
    const trackingId = await generateTrackingId();

    // 6. Create Complaint
    const complaint = await Complaint.create({
      trackingId,
      citizen: req.user._id,
      citizenName: req.user.name,
      citizenPhone: req.user.phone || '',
      citizenEmail: req.user.email,
      title,
      description,
      mainCategory: finalCategory,
      subcategory: finalSubcategory,
      department: assignedDepartment,
      severity: aiAnalysis.predictedSeverity || 'MEDIUM',
      priority: priorityData.priority,
      urgency: urgency || 'MEDIUM',
      safetyRisk: safetyRisk || 'MEDIUM',
      publicImpact: publicImpact || 'MEDIUM',
      status: 'SUBMITTED',
      slaState: 'ON_TRACK',
      slaDeadline: priorityData.slaDeadline,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      formattedAddress: formattedAddress || 'Sathyamangalam, Tamil Nadu',
      locality: locality || '',
      city: city || 'Sathyamangalam',
      pincode: pincode || '',
      gpsAccuracy: gpsAccuracy ? parseFloat(gpsAccuracy) : 10,
      imageUrl,
      publicId,
      aiClassification: {
        isAiAssisted: aiAnalysis.isAiAssisted,
        predictedCategory: aiAnalysis.predictedCategory,
        predictedSubcategory: aiAnalysis.predictedSubcategory,
        confidenceScore: aiAnalysis.confidenceScore,
        explanation: aiAnalysis.explanation,
      },
      duplicateCheck: {
        isDuplicateFlagged: duplicateData.isDuplicate,
        potentialDuplicateOf: duplicateData.matchedComplaint?._id || null,
        similarityScore: duplicateData.similarityScore,
        duplicateWarningDismissed: Boolean(duplicateWarningDismissed),
      },
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Complaint registered by citizen and routed to department queue.',
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          role: 'citizen',
          timestamp: new Date(),
        },
      ],
    });

    // 7. Notify Citizen
    await Notification.create({
      recipient: req.user._id,
      title: 'Complaint Registered Successfully',
      message: `Your report "${title}" has been registered with tracking ID ${trackingId} and assigned to ${assignedDepartment}.`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId,
    });

    // 8. Automated Verifier Dispatch based on active availability & lowest workload
    const dispatchResult = await autoAssignComplaint(complaint);

    // 9. Notify Department Head
    const deptHead = await User.findOne({ role: 'dept_head', department: assignedDepartment });
    if (deptHead) {
      await Notification.create({
        recipient: deptHead._id,
        title: `New ${priorityData.priority} Priority Complaint`,
        message: dispatchResult.success
          ? `New incident #${trackingId} (${finalSubcategory}) auto-assigned to ${dispatchResult.verifier?.name}.`
          : `New incident #${trackingId} (${finalSubcategory}) requires manual verifier assignment.`,
        type: 'ASSIGNMENT',
        complaintId: complaint._id,
        trackingId,
      });
    }

    res.status(201).json({
      success: true,
      message: dispatchResult.success
        ? `Complaint submitted and automatically assigned to ${dispatchResult.verifier?.name} based on availability.`
        : 'Complaint submitted successfully.',
      complaint,
      autoDispatched: dispatchResult.success,
      assignedVerifier: dispatchResult.verifier?.name || null,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Citizen's own complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .sort({ createdAt: -1 });

    // Refresh SLA states dynamically
    const updated = complaints.map(c => {
      const doc = c.toObject();
      doc.slaState = getSlaState(c.slaDeadline, c.status);
      return doc;
    });

    res.status(200).json({
      success: true,
      count: updated.length,
      complaints: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track Complaint by Tracking ID (e.g. #CMP62745974)
export const trackComplaint = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const formattedId = trackingId.startsWith('#') ? trackingId : `#${trackingId}`;

    const complaint = await Complaint.findOne({ trackingId: formattedId })
      .populate('assignedVerifier', 'name email phone designation');

    if (!complaint) {
      return res.status(404).json({ success: false, message: `No complaint found with ID ${formattedId}` });
    }

    const doc = complaint.toObject();
    doc.slaState = getSlaState(complaint.slaDeadline, complaint.status);

    res.status(200).json({
      success: true,
      complaint: doc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Nearby Complaints (Geospatial)
export const getNearbyComplaints = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const complaints = await Complaint.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius, 10),
        },
      },
    }).limit(20);

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    // Fallback if 2dsphere index query fails
    const complaints = await Complaint.find().limit(20);
    res.status(200).json({ success: true, count: complaints.length, complaints });
  }
};

// Get Single Complaint Detail
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('assignedVerifier', 'name email phone designation');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const doc = complaint.toObject();
    doc.slaState = getSlaState(complaint.slaDeadline, complaint.status);

    res.status(200).json({
      success: true,
      complaint: doc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Citizen Confirmation of Resolution
export const confirmResolution = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the citizen who submitted this complaint can confirm its resolution.' });
    }

    complaint.status = 'CLOSED';
    complaint.citizenConfirmation = {
      isConfirmed: true,
      rating: rating ? Number(rating) : 5,
      feedback: feedback || 'Citizen confirmed issue resolved successfully.',
      confirmedAt: new Date(),
    };

    complaint.statusHistory.push({
      status: 'CLOSED',
      note: `Citizen confirmed satisfactory resolution (Rating: ${rating || 5}/5). Complaint closed.`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'citizen',
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Resolution confirmed and complaint closed. Thank you for making our city better!',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reopen Complaint (Citizen Access)
export const reopenComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the citizen who originally submitted this complaint can reopen it.',
      });
    }

    // Only allow reopening if it was resolved or verified & closed
    if (!['VERIFIED_AND_CLOSED', 'CLOSED', 'RESOLVED'].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only verified & closed or resolved complaints can be reopened.',
      });
    }

    complaint.status = 'REOPENED';
    complaint.isEscalated = true; // Automatically mark escalated on reopen
    complaint.reopenDetails = {
      isReopened: true,
      reason: reason || 'Issue still persists and requires on-site attention.',
      reopenedBy: req.user._id,
      reopenedByName: req.user.name,
      reopenedAt: new Date(),
      reopenCount: (complaint.reopenDetails?.reopenCount || 0) + 1,
    };

    complaint.statusHistory.push({
      status: 'REOPENED',
      note: `Citizen reopened grievance: "${reason || 'Issue still persists and requires re-inspection.'}". Escalated to Department Head.`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'citizen',
      timestamp: new Date(),
    });

    await complaint.save();

    // Alert Department Head immediately
    const deptHead = await User.findOne({ role: 'dept_head', department: complaint.department });
    if (deptHead) {
      await Notification.create({
        recipient: deptHead._id,
        title: `⚠️ Grievance Reopened by Citizen`,
        message: `Citizen ${req.user.name} reopened incident #${complaint.trackingId} (${complaint.title}). Reason: ${reason || 'Unresolved issue.'}`,
        type: 'SLA_ALERT',
        complaintId: complaint._id,
        trackingId: complaint.trackingId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Complaint #${complaint.trackingId} has been reopened and escalated to the Department Head.`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
