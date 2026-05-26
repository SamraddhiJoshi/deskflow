import { useState } from 'react';
import { createTicket } from '../api/tickets';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function validate() {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.customerEmail.trim()) {
      e.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      e.customerEmail = 'Enter a valid email address';
    }
    if (!form.priority) e.priority = 'Priority is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      const ticket = await createTicket(form);
      onCreated(ticket);
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>New Support Ticket</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="Brief description of the issue"
              value={form.subject}
              onChange={e => handleChange('subject', e.target.value)}
            />
            {errors.subject && <p className="field-error">{errors.subject}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Detailed explanation of the issue"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              value={form.customerEmail}
              onChange={e => handleChange('customerEmail', e.target.value)}
            />
            {errors.customerEmail && <p className="field-error">{errors.customerEmail}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            {errors.priority && <p className="field-error">{errors.priority}</p>}
          </div>

          {serverError && <p className="field-error" style={{ marginBottom: 8 }}>{serverError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
