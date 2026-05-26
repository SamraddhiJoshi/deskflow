export default function StatsStrip({ stats }) {
  if (!stats) return null;

  const { byStatus, byPriority, breachedOpen } = stats;

  return (
    <div className="stats-strip">
      <div className="stat-chip">Open: <span>{byStatus.open}</span></div>
      <div className="stat-chip">In Progress: <span>{byStatus.in_progress}</span></div>
      <div className="stat-chip">Resolved: <span>{byStatus.resolved}</span></div>
      <div className="stat-chip">Closed: <span>{byStatus.closed}</span></div>
      <div className="stat-chip">Urgent: <span>{byPriority.urgent}</span></div>
      <div className="stat-chip">High: <span>{byPriority.high}</span></div>
      <div className="stat-chip">Medium: <span>{byPriority.medium}</span></div>
      <div className="stat-chip">Low: <span>{byPriority.low}</span></div>
      <div className="stat-chip breached">SLA Breached (open): <span>{breachedOpen}</span></div>
    </div>
  );
}
