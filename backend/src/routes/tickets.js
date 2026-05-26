const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');
const { computeDerivedFields, validateTransition } = require('../utils/sla');

// attach derived fields to a ticket object
function formatTicket(ticket) {
  const { ageMinutes, slaBreached } = computeDerivedFields(ticket);
  const obj = ticket.toObject();
  return { ...obj, ageMinutes, slaBreached };
}

// POST /tickets — create a ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({
        error: 'Missing required fields: subject, description, customerEmail, priority'
      });
    }

    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();

    res.status(201).json(formatTicket(ticket));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /tickets/stats — must come BEFORE /:id
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find();

    const stats = {
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      breachedOpen: 0
    };

    for (const ticket of tickets) {
      stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;

      const { slaBreached } = computeDerivedFields(ticket);
      // only count as breachedOpen if still unresolved
      if (slaBreached && ticket.status !== 'resolved' && ticket.status !== 'closed') {
        stats.breachedOpen++;
      }
    }

    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /tickets — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      query.status = status;
    }

    if (priority) {
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
      }
      query.priority = priority;
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });
    let formatted = tickets.map(formatTicket);

    if (breached === 'true') {
      formatted = formatted.filter(t => t.slaBreached);
    }

    res.json(formatted);
  } catch (err) {
    console.error('List tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// PATCH /tickets/:id — change status
router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const { valid, error } = validateTransition(ticket.status, status);
    if (!valid) {
      return res.status(400).json({ error });
    }

    // set or clear resolvedAt based on status change
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (ticket.status === 'resolved' && status !== 'resolved') {
      ticket.resolvedAt = null;
    }

    ticket.status = status;
    await ticket.save();

    res.json(formatTicket(ticket));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    console.error('Delete ticket error:', err);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

module.exports = router;
