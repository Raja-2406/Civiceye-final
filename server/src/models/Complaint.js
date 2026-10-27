import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedByName: {
    type: String,
    default: 'System',
  },
  role: {
    type: String,
    default: 'system',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    citizenName: {
      type: String,
      required: true,
    },
    citizenPhone: {
      type: String,
      default: '',
    },
    citizenEmail: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    mainCategory: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    assignedVerifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedVerifierName: {
      type: String,
      default: 'Unassigned',
    },
    deptHeadInstructions: {
      type: String,
      default: '', // Instructions & remarks given by Department Head to the Verifier
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    safetyRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    publicImpact: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED', 'REOPENED'],
      default: 'SUBMITTED',
      index: true,
    },
    slaState: {
      type: String,
      enum: ['ON_TRACK', 'AT_RISK', 'BREACHED'],
      default: 'ON_TRACK',
    },
    slaDeadline: {
      type: Date,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'Sathyamangalam',
    },
    pincode: {
      type: String,
      default: '',
    },
    gpsAccuracy: {
      type: Number,
      default: 10,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
    aiClassification: {
      isAiAssisted: { type: Boolean, default: false },
      predictedCategory: { type: String, default: '' },
      predictedSubcategory: { type: String, default: '' },
      confidenceScore: { type: Number, default: 0 },
      explanation: { type: String, default: '' },
      reviewedByAdmin: { type: Boolean, default: false },
    },
    duplicateCheck: {
      isDuplicateFlagged: { type: Boolean, default: false },
      potentialDuplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        default: null,
      },
      similarityScore: { type: Number, default: 0 },
      distanceMeters: { type: Number, default: 0 },
      duplicateWarningDismissed: { type: Boolean, default: false },
    },
    statusHistory: [statusHistorySchema],
    verificationReport: {
      verifierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifierName: { type: String, default: '' },
      notes: { type: String, default: '' },
      proofImageUrl: { type: String, default: '' },
      completedAt: { type: Date },
    },
    deptHeadVerification: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedByName: { type: String, default: '' },
      remarks: { type: String, default: '' },
      verifiedAt: { type: Date },
    },
    reopenDetails: {
      isReopened: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      reopenedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reopenedByName: { type: String, default: '' },
      reopenedAt: { type: Date },
      reopenCount: { type: Number, default: 0 },
    },
    citizenConfirmation: {
      isConfirmed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, default: '' },
      confirmedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// 2dsphere index for location-based spatial queries (500m radius nearby complaints)
complaintSchema.index({ location: '2dsphere' });

export default mongoose.model('Complaint', complaintSchema);
