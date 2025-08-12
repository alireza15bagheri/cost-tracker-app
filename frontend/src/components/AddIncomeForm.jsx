// import { useState } from 'react';
// import { createIncome } from '../services/incomes';
// import './AddIncomeForm.css';

// export default function AddIncomeForm({ onAddIncome }) {
//   const [formData, setFormData] = useState({
//     source: '',
//     amount: '',
//     date_received: '',
//     period: '',
//   });

//   const [submitError, setSubmitError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((s) => ({ ...s, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitError(null);

//     if (!formData.date_received) {
//       setSubmitError('Please select a valid date.');
//       return;
//     }

//     try {
//       const payload = {
//         source: formData.source.trim(),
//         amount: Number(formData.amount),
//         date_received: formData.date_received,
//         period: formData.period,
//       };

//       const created = await createIncome(payload);
//       onAddIncome?.(created);

//       setFormData({ source: '', amount: '', date_received: '', period: '' });
//     } catch (err) {
//       const msg =
//         err?.response?.data
//           ? typeof err.response.data === 'string'
//             ? err.response.data
//             : JSON.stringify(err.response.data)
//           : err?.message || 'Failed to submit.';
//       setSubmitError(msg);
//       console.error('AddIncomeForm submit error:', err);
//     }
//   };

//   return (
//     <form className="income-form" onSubmit={handleSubmit} noValidate>
//       <input
//         name="source"
//         type="text"
//         placeholder="Source"
//         value={formData.source}
//         onChange={handleChange}
//         required
//       />

//       <input
//         name="amount"
//         type="number"
//         step="0.01"
//         placeholder="Amount"
//         value={formData.amount}
//         onChange={handleChange}
//         required
//       />

//       {/* Simple native Gregorian date input */}
//       <input
//         name="date_received"
//         type="date"
//         value={formData.date_received}
//         onChange={handleChange}
//         required
//       />

//       <input
//         name="period"
//         type="number"
//         placeholder="Period ID"
//         value={formData.period}
//         onChange={handleChange}
//         required
//       />

//       <button type="submit">Submit</button>

//       {submitError && (
//         <div className="form-error" aria-live="polite">
//           {submitError}
//         </div>
//       )}
//     </form>
//   );
// }


import { useState } from 'react';
import { createIncome } from '../services/incomes';
import './AddIncomeForm.css';

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

    // Frontend validation
    if (!activePeriodId) {
      setSubmitError('Please select an active period first.');
      return;
    }
    if (!formData.source?.trim()) {
      setSubmitError('Source is required.');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount))) {
      setSubmitError('Amount must be a number.');
      return;
    }
    if (!formData.date_received) {
      setSubmitError('Please select a valid date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        source: formData.source.trim(),
        amount: Number(formData.amount),
        date_received: formData.date_received, // native input gives YYYY-MM-DD
        period: activePeriodId, // always use active period
      };

      const created = await createIncome(payload);
      onAddIncome?.(created);

      // Reset form
      setFormData({ source: '', amount: '', date_received: '' });
    } catch (err) {
      // Graceful handling for invalid period (400)
      const data = err?.response?.data;
      if (data?.period) {
        setSubmitError('Selected period no longer exists or is invalid. Please choose another period.');
      } else if (typeof data === 'string') {
        setSubmitError(data);
      } else if (data) {
        setSubmitError(JSON.stringify(data));
      } else {
        setSubmitError(err?.message || 'Failed to submit.');
      }
      console.error('AddIncomeForm submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="income-form" onSubmit={handleSubmit} noValidate>
      <input
        name="source"
        type="text"
        placeholder="Source"
        value={formData.source}
        onChange={handleChange}
        required
      />

      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
        required
      />

      <input
        name="date_received"
        type="date"
        value={formData.date_received}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={submitting || !activePeriodId}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>

      {submitError && (
        <div className="form-error" aria-live="polite">
          {submitError}
        </div>
      )}
    </form>
  );
}
