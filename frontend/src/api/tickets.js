const BASE = 'https://deskflow-backend-omq7.onrender.com';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const getTickets = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.breached) params.append('breached', 'true');
  const qs = params.toString();
  return request(`/tickets${qs ? '?' + qs : ''}`);
};

export const createTicket = (data) =>
  request('/tickets', { method: 'POST', body: JSON.stringify(data) });

export const updateStatus = (id, status) =>
  request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const deleteTicket = (id) =>
  request(`/tickets/${id}`, { method: 'DELETE' });

export const getStats = () => request('/tickets/stats');
