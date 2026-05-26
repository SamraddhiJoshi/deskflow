// SLA response targets in minutes
const SLA_TARGETS = {
  urgent: 60,     // 1 hour
  high: 240,      // 4 hours
  medium: 1440,   // 24 hours
  low: 4320       // 72 hours
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

function computeDerivedFields(ticket) {
  // age stops growing once resolved
  const endTime = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
  const ageMinutes = Math.floor((endTime - new Date(ticket.createdAt)) / 60000);

  const target = SLA_TARGETS[ticket.priority];
  const slaBreached = ageMinutes > target;

  return { ageMinutes, slaBreached };
}

function validateTransition(currentStatus, newStatus) {
  const fromIdx = STATUS_ORDER.indexOf(currentStatus);
  const toIdx = STATUS_ORDER.indexOf(newStatus);

  if (fromIdx === toIdx) {
    return { valid: false, error: 'Ticket is already in that status' };
  }

  // forward exactly one step
  if (toIdx === fromIdx + 1) {
    return { valid: true };
  }

  // backward exactly one step
  if (toIdx === fromIdx - 1) {
    return { valid: true };
  }

  if (toIdx > fromIdx) {
    return {
      valid: false,
      error: `Cannot skip from "${currentStatus}" to "${newStatus}". Move one step at a time.`
    };
  }

  return {
    valid: false,
    error: `Cannot move back more than one step from "${currentStatus}" to "${newStatus}".`
  };
}

module.exports = { computeDerivedFields, validateTransition, SLA_TARGETS };
