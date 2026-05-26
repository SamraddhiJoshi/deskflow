import { useState } from 'react';
import { updateStatus, deleteTicket } from '../api/tickets';

// what adjacent moves are allowed from each status
const NEXT_STATUS = {
  open:        ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved:    ['in_progress', 'closed'],
  closed:      ['resolved']
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function TicketCard({ ticket, onUpdated, onDeleted, onDragStart }) {
  const [snapError, setSnapError] = useState('');
  const [moving, setMoving] = useState(false);

  async function handleMove(newStatus) {
    setMoving(true);
    setSnapError('');
    try {
      const updated = await updateStatus(ticket._id, newStatus);
      onUpdated(updated);
    } catch (err) {
      setSnapError(err.message);
      setTimeout(() => setSnapError(''), 3000);
    } finally {
      setMoving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(ticket._id);
      onDeleted(ticket._id);
    } catch (err) {
      setSnapError(err.message);
    }
  }

  const nextMoves = NEXT_STATUS[ticket.status] || [];

  return (
    <div
      className={`ticket-card ${ticket.slaBreached ? 'sla-breached' : ''}`}
      draggable
      onDragStart={() => onDragStart(ticket)}
    >
      <div className="card-top">
        <p className="card-subject">{ticket.subject}</p>
        <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
      </div>

      <div className="card-meta">
        <span>⏱ {formatAge(ticket.ageMinutes)}</span>
        {ticket.slaBreached && <span className="sla-breached-badge">SLA Breached</span>}
      </div>

      <div className="card-actions">
        {nextMoves.map(s => (
          <button
            key={s}
            className="btn-move"
            onClick={() => handleMove(s)}
            disabled={moving}
            title={`Move to ${STATUS_LABELS[s]}`}
          >
            → {STATUS_LABELS[s]}
          </button>
        ))}
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>

      {snapError && <p className="snap-error">{snapError}</p>}
    </div>
  );
}
