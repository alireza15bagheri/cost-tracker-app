import { useState } from 'react';
import { createIncome } from '../services/incomes';
import FormInput from '../components/FormInput'; // Import reusable input
import '../styles/FormStyles.css';

export default function AddIncomeForm({ onAddIncome, activePeriodId }) {
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date_received: '',
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic validation
    if (!activePeriodId) return setSubmitError('Please select an active period first.');
    if (!formData.source?.trim()) return setSubmitError('Source is required.');
    if (!formData.amount || isNaN(Number(formData.amount))) return setSubmitError('Amount must be a number.');
    if (!formData.date_received) return setSubmitError('Please select a valid date.');

    try {
      setSubmitting(true);
      const payload = {
        source: formData.source.trim(),
        amount: Number(formData.amount),
        date_received: formData.date_received,
        period: activePeriodId,
      };

      const created = await createIncome(payload);
      onAddIncome?.(created);
      setFormData({ source: '', amount: '', date_received: '' });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.period) {
        setSubmitError('Selected period no longer exists or is invalid.');
      } else {
        setSubmitError(data?.message || JSON.stringify(data) || 'Failed to submit.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="app-form" onSubmit={handleSubmit} noValidate>
      <h3>Add New Income</h3>
      <FormInput
        name="source"
        type="text"
        placeholder="Source"
        value={formData.source}
        onChange={handleChange}
      />
      <FormInput
        name="amount"
        type="number"
        step="0.01"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
      />
      <FormInput
        name="date_received"
        type="date"
        value={formData.date_received}
        onChange={handleChange}
      />

      <button type="submit" disabled={submitting || !activePeriodId}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>

      {submitError && <div className="error">{submitError}</div>}
    </form>
  );
}
