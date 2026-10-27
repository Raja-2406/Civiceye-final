/**
 * Deterministic Priority Engine
 * Computes priority from Severity, Urgency, Safety Risk, and Public Impact.
 * Calculates standard Municipal SLA deadlines.
 */
export const calculateDeterministicPriority = ({
  severity = 'MEDIUM',
  urgency = 'MEDIUM',
  safetyRisk = 'MEDIUM',
  publicImpact = 'MEDIUM',
}) => {
  const severityWeights = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const genericWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };

  const sVal = severityWeights[severity.toUpperCase()] || 2;
  const uVal = genericWeights[urgency.toUpperCase()] || 2;
  const srVal = genericWeights[safetyRisk.toUpperCase()] || 2;
  const piVal = genericWeights[publicImpact.toUpperCase()] || 2;

  // Weighted calculation formula
  const weightedScore = (sVal * 0.4) + (srVal * 0.25) + (piVal * 0.2) + (uVal * 0.15);

  let priority = 'MEDIUM';
  let slaHours = 72; // default 3 days

  if (weightedScore >= 3.2 || sVal === 4) {
    priority = 'CRITICAL';
    slaHours = 24; // 1 day
  } else if (weightedScore >= 2.4 || sVal === 3) {
    priority = 'HIGH';
    slaHours = 48; // 2 days
  } else if (weightedScore >= 1.7) {
    priority = 'MEDIUM';
    slaHours = 72; // 3 days
  } else {
    priority = 'LOW';
    slaHours = 120; // 5 days
  }

  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  return {
    priority,
    weightedScore: Math.round(weightedScore * 100) / 100,
    slaHours,
    slaDeadline,
  };
};

/**
 * Compute current SLA status (ON_TRACK, AT_RISK, BREACHED)
 */
export const getSlaState = (slaDeadline, currentStatus) => {
  if (['RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED'].includes(currentStatus)) {
    return 'ON_TRACK';
  }

  if (!slaDeadline) return 'ON_TRACK';

  const now = new Date().getTime();
  const deadline = new Date(slaDeadline).getTime();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return 'BREACHED';
  } else if (diffHours <= 12) {
    return 'AT_RISK';
  } else {
    return 'ON_TRACK';
  }
};
