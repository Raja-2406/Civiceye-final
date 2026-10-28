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
export const findOptimalAvailableVerifier = async (department, requireAvailableCapacity = true) => {
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

    const maxTasks = v.maxConcurrentTasks || 5;
    return {
      verifier: v,
      activeTasksCount,
      capacityAvailable: activeTasksCount < maxTasks,
    };
  });

  const candidatesWithWorkload = await Promise.all(workloadPromises);

  // Filter only those who haven't exceeded maximum concurrency capacity
  const availableCandidates = candidatesWithWorkload.filter(c => c.capacityAvailable);

  if (requireAvailableCapacity && availableCandidates.length === 0) {
    // All verifiers in this department are currently at max capacity
    return null;
  }

  // Sort by lowest active workload ascending
  const pool = availableCandidates.length > 0 ? availableCandidates : candidatesWithWorkload;
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
export const autoAssignComplaint = async (complaint, requireAvailableCapacity = true) => {
  try {
    const optimal = await findOptimalAvailableVerifier(complaint.department, requireAvailableCapacity);

    if (!optimal || !optimal.verifier) {
      console.log(`[Auto-Dispatch] No available verifiers with capacity found for department "${complaint.department}". Queued in unassigned backlog.`);
      return { success: false, reason: 'No available verifiers with capacity for department.' };
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

/**
 * Drains the unassigned queue for a specific department:
 * Iterates through pending SUBMITTED unassigned complaints ordered by priority & submission age,
 * automatically dispatching them to available verifiers until capacity is filled.
 */
export const drainUnassignedQueueForDepartment = async (department) => {
  if (!department) return { dispatchedCount: 0, remainingUnassigned: 0 };

  try {
    const pendingComplaints = await Complaint.find({
      department,
      assignedVerifier: null,
      status: 'SUBMITTED',
    });

    if (!pendingComplaints || pendingComplaints.length === 0) {
      return { dispatchedCount: 0, remainingUnassigned: 0 };
    }

    // Priority ranking: CRITICAL first, then HIGH, then MEDIUM, then LOW, then oldest
    const priorityRank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
    pendingComplaints.sort((a, b) => {
      const rankA = priorityRank[a.priority] || 3;
      const rankB = priorityRank[b.priority] || 3;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    let dispatchedCount = 0;
    for (const complaint of pendingComplaints) {
      const result = await autoAssignComplaint(complaint, true);
      if (result && result.success) {
        dispatchedCount++;
      } else {
        // No more capacity available in this department right now
        break;
      }
    }

    const remainingUnassigned = pendingComplaints.length - dispatchedCount;
    if (dispatchedCount > 0) {
      console.log(`[Auto-Dispatch Queue] Dispatched ${dispatchedCount} complaints for "${department}". Remaining waiting: ${remainingUnassigned}`);
    }

    return { dispatchedCount, remainingUnassigned };
  } catch (err) {
    console.error(`[Auto-Dispatch Queue Error for ${department}]`, err.message);
    return { dispatchedCount: 0, error: err.message };
  }
};

/**
 * Sweeps all departments with unassigned complaints and drains their queues
 */
export const sweepAllUnassignedQueues = async () => {
  try {
    const departmentsWithPending = await Complaint.distinct('department', {
      assignedVerifier: null,
      status: 'SUBMITTED',
    });

    if (!departmentsWithPending || departmentsWithPending.length === 0) {
      return { totalDispatched: 0 };
    }

    let totalDispatched = 0;
    for (const dept of departmentsWithPending) {
      const res = await drainUnassignedQueueForDepartment(dept);
      totalDispatched += res.dispatchedCount || 0;
    }

    return { totalDispatched };
  } catch (err) {
    console.error('[Auto-Dispatch Sweeper Error]', err.message);
    return { totalDispatched: 0, error: err.message };
  }
};

let sweeperIntervalId = null;

/**
 * Starts a background queue sweeper running on a periodic interval
 */
export const startPeriodicQueueSweeper = (intervalMs = 60000) => {
  if (sweeperIntervalId) return;
  console.log(`[Auto-Dispatch] Periodic queue sweeper initialized (interval: ${intervalMs / 1000}s).`);
  sweeperIntervalId = setInterval(async () => {
    await sweepAllUnassignedQueues();
  }, intervalMs);
};
