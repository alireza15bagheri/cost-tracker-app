// /home/alireza/cost-tracker/frontend/src/components/MiscellaneousCosts.jsx
import React, { useState } from 'react';
import { createMiscellaneousCost, deleteMiscellaneousCost } from '../services/miscellaneousCosts';
import { formatAmount } from '../utils/format';
import FormInput from './FormInput';

export default function MiscellaneousCosts({ periodId, costs, onCostAdded, onCostDeleted }) {
  const [form, setForm] = useState({ title: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.title.trim()) return setErr('Title is required.');
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      return setErr('Amount must be a positive number.');
    }

    try {
      setSubmitting(true);
      const payload = {
        period: periodId,
        title: form.title.trim(),
        amount: Number(form.amount),
      };
      const newCost = await createMiscellaneousCost(payload);
      onCostAdded?.(newCost);
      setForm({ title: '', amount: '' });
    } catch (e2) {
      console.error('Failed to create cost', e2);
      const apiErr = e2?.response?.data;
      const message = apiErr?.detail || (apiErr ? JSON.stringify(apiErr) : e2.message) || 'Could not save entry';
      setErr(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cost?')) return;
    setDeletingId(id);
    setErr('');
    try {
      await deleteMiscellaneousCost(id);
      onCostDeleted?.(id);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || e2.message || 'Failed to delete cost.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="app-form">
        <h3>Add Cost</h3>
        {err && <div className="error">{err}</div>}
        <FormInput
          name="title"
          type="text"
          placeholder="Cost Title (e.g., Car Repair)"
          value={form.title}
          onChange={handleChange}
        />
        <FormInput
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Cost'}
        </button>
      </form>

      {costs.length > 0 && (
        <ul className="item-list" style={{marginTop: '1.5rem'}}>
          {costs.map((cost) => (
            <li key={cost.id}>
              <span>
                {cost.title}: {formatAmount(cost.amount)}
              </span>
              <button
                className="toggle-button danger"
                onClick={() => handleDelete(cost.id)}
                disabled={deletingId === cost.id}
              >
                {deletingId === cost.id ? '...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}