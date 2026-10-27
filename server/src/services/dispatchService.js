import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

/**
 * Automated Verifier Dispatch Engine
 * Selects the optimal field verifier based on:
 * 1. Matching Department Scope
 * 2. Active Duty Availability (isAvailable !== false)
 * 3. Least Current Workload (fewest active complaints in ASSIGNED or IN_PROGRESS status)
 * 4. Capacity Limit (under maxConcurrentTasks limit)
 */
export const findOptimalAvailableVerifier = async (department) => {
  if (!department) return null;

  // 1. Find all active verifiers for this municipal department
  const verifiers = await User.find({
    role: 'verifier',
    department,
    isAvailable: { $ne: false },
  });

  if (!verifiers || verifiers.length === 0) {
    return null;
  }

  // 2. Compute live workload for each candidate verifier
  const workloadPromises = verifiers.map(async (v) => {
    const activeTasksCount = await Complaint.countDocuments({
      assignedVerifier: v._id,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
    });

    return {
      verifier: v,
      activeTasksCount,
      capacityAvailable: activeTasksCount < (v.maxConcurrentTasks || 5),
    };
  });

  const candidatesWithWorkload = await Promise.all(workloadPromises);

  // Filter only those who haven't exceeded maximum concurrency capacity
  const availableCandidates = candidatesWithWorkload.filter(c => c.capacityAvailable);

  // If all are at max capacity, select the least overloaded one anyway
  const pool = availableCandidates.length > 0 ? availableCandidates : candidatesWithWorkload;

  // 3. Sort by lowest active workload ascending
  pool.sort((a, b) => a.activeTasksCount - b.activeTasksCount);

  const optimal = pool[0];

  return {
    verifier: optimal.verifier,
    activeWorkload: optimal.activeTasksCount,
    reason: `Automated Dispatch: Selected based on lowest active workload (${optimal.activeTasksCount} active tasks).`,
  };
};

/**
 * Automatically assigns a complaint to an available verifier
 */
export const autoAssignComplaint = async (complaint) => {
  try {
    const optimal = await findOptimalAvailableVerifier(complaint.department);

    if (!optimal || !optimal.verifier) {
      console.log(`[Auto-Dispatch] No available verifiers found for department "${complaint.department}". Queued for manual assignment.`);
      return { success: false, reason: 'No available verifiers for department.' };
    }

    const { verifier, activeWorkload, reason } = optimal;

    complaint.assignedVerifier = verifier._id;
    complaint.assignedVerifierName = verifier.name;
    complaint.status = 'ASSIGNED';

    complaint.statusHistory.push({
      status: 'ASSIGNED',
      note: `${reason}`,
      updatedBy: verifier._id,
      updatedByName: 'Automated Dispatch Engine',
      role: 'system',
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify the assigned Verifier
    await Notification.create({
      recipient: verifier._id,
      title: 'Automated Task Assignment',
      message: `You were automatically assigned to incident #${complaint.trackingId} (${complaint.title}) based on your current availability.`,
      type: 'ASSIGNMENT',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: 'Verifier Automatically Assigned',
      message: `Your grievance #${complaint.trackingId} has been automatically assigned to field officer ${verifier.name} (${complaint.department}).`,
      type: 'STATUS_CHANGE',
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });

    console.log(`[Auto-Dispatch] Successfully assigned #${complaint.trackingId} to ${verifier.name} (Active Tasks: ${activeWorkload})`);

    return {
      success: true,
      verifier,
      activeWorkload,
    };
  } catch (error) {
    console.error('[Auto-Dispatch Error]', error.message);
    return { success: false, error: error.message };
  }
};
