const BASE = 'https://deskflow-backend-omq7.onrender.com';

export const getTickets = async () => {
  const res = await fetch(`${BASE}/bfhl`);

  if (!res.ok) {
    throw new Error('Request failed');
  }

  return await res.json();
};

export const createTicket = async () => ({});
export const updateStatus = async () => ({});
export const deleteTicket = async () => ({});
export const getStats = async () => ({});
