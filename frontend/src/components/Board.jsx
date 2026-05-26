import { useState } from 'react';
import TicketCard from './TicketCard';
import { updateStatus } from '../api/tickets';

const COLUMNS = [
  { status: 'open',        label: 'Open' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'resolved',    label: 'Resolved' },
  { status: 'closed',      label: 'Closed' }
];

// allowed forward transitions for drag-and-drop validation
const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

function canTransition(from, to) {
  const fi = STATUS_ORDER.indexOf(from);
  const ti = STATUS_ORDER.indexOf(to);
  return Math.abs(fi - ti) === 1;
}

export default function Board({ tickets, onUpdated, onDeleted }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [dropError, setDropError] = useState({});

  async function handleDrop(targetStatus) {
    if (!dragging) return;
    setDragOver(null);

    if (dragging.status === targetStatus) {
      setDragging(null);
      return;
    }

    if (!canTransition(dragging.status, targetStatus)) {
      setDropError(prev => ({ ...prev, [targetStatus]: `Can't move from ${dragging.status} to ${targetStatus}` }));
      setTimeout(() => setDropError(prev => ({ ...prev, [targetStatus]: '' })), 2500);
      setDragging(null);
      return;
    }

    try {
      const updated = await updateStatus(dragging._id, targetStatus);
      onUpdated(updated);
    } catch (err) {
      setDropError(prev => ({ ...prev, [targetStatus]: err.message }));
      setTimeout(() => setDropError(prev => ({ ...prev, [targetStatus]: '' })), 2500);
    }
    setDragging(null);
  }

  return (
    <div className="board">
      {COLUMNS.map(col => {
        const colTickets = tickets.filter(t => t.status === col.status);
        return (
          <div
            key={col.status}
            className={`column ${dragOver === col.status ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.status)}
          >
            <div className="column-header">
              <div className="column-title">
                <span className={`col-dot ${col.status}`} />
                {col.label}
              </div>
              <span className="col-count">{colTickets.length}</span>
            </div>

            <div className="column-cards">
              {dropError[col.status] && (
                <p className="snap-error" style={{ marginBottom: 6 }}>{dropError[col.status]}</p>
              )}
              {colTickets.length === 0 ? (
                <p className="empty-col">No tickets</p>
              ) : (
                colTickets.map(t => (
                  <TicketCard
                    key={t._id}
                    ticket={t}
                    onUpdated={onUpdated}
                    onDeleted={onDeleted}
                    onDragStart={setDragging}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
