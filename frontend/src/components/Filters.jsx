const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];

export default function Filters({ filters, onChange }) {
  return (
    <div className="filters-bar">
      <div>
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={e => onChange({ ...filters, priority: e.target.value })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.slice(1).map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={filters.breached}
          onChange={e => onChange({ ...filters, breached: e.target.checked })}
        />
        SLA Breached only
      </label>
    </div>
  );
}
