import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import StatsStrip from './components/StatsStrip';
import Filters from './components/Filters';
import CreateTicketModal from './components/CreateTicketModal';
import { getTickets, getStats } from './api/tickets';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ priority: '', breached: false });

  const loadAll = useCallback(async () => {
    try {
      setError('');
      const [ticketData, statsData] = await Promise.all([
        getTickets(filters),
        getStats()
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    loadAll();
  }, [loadAll]);

  // refresh stats after any mutation
  async function refreshStats() {
    try {
      const s = await getStats();
      setStats(s);
    } catch (_) {}
  }

  function handleTicketCreated(ticket) {
    // only add if it passes current filters
    const priorityOk = !filters.priority || ticket.priority === filters.priority;
    const breachedOk = !filters.breached || ticket.slaBreached;
    if (priorityOk && breachedOk) {
      setTickets(prev => [ticket, ...prev]);
    }
    refreshStats();
  }

  function handleTicketUpdated(updated) {
    setTickets(prev => {
      const list = prev.map(t => t._id === updated._id ? updated : t);
      // re-apply filters
      return list.filter(t => {
        const priorityOk = !filters.priority || t.priority === filters.priority;
        const breachedOk = !filters.breached || t.slaBreached;
        return priorityOk && breachedOk;
      });
    });
    refreshStats();
  }

  function handleTicketDeleted(id) {
    setTickets(prev => prev.filter(t => t._id !== id));
    refreshStats();
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>DeskFlow</h1>
          <p>Support Ticket Triage Board</p>
        </div>
        <button
          id="create-ticket-btn"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Ticket
        </button>
      </header>

      <StatsStrip stats={stats} />

      <Filters filters={filters} onChange={setFilters} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading tickets...</p>
      ) : (
        <Board
          tickets={tickets}
          onUpdated={handleTicketUpdated}
          onDeleted={handleTicketDeleted}
        />
      )}

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </>
  );
}
