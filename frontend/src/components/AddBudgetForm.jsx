import { useEffect, useState } from 'react';
import { createBudget } from '../services/budgets';
import { listCategories } from '../services/categories';
import FormInput from '../components/FormInput';
import '../styles/FormStyles.css';

export default function AddBudgetForm({ activePeriodId, onAddBudget }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    amount_allocated: '',
    due_date: '',
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await listCategories();
        if (!mounted) return;
        setCategories(cats || []);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!activePeriodId) return setSubmitError('Please select an active period first.');
    if (!formData.category) return setSubmitError('Category is required.');
    if (!formData.amount_allocated || isNaN(Number(formData.amount_allocated))) {
      return setSubmitError('Amount must be a number.');
    }

    try {
      setSubmitting(true);
      const payload = {
        category_id: Number(formData.category), 
        amount_allocated: Number(formData.amount_allocated),
        status: 'not_paid',
        due_date: formData.due_date || null,
        period: activePeriodId,
      };

      const created = await createBudget(payload);
      onAddBudget?.(created);
      setFormData({
        category: '',
        amount_allocated: '',
        due_date: '',
      });
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
      <h3>Add New Budget</h3>

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <FormInput
        name="amount_allocated"
        type="number"
        step="0.01"
        placeholder="Amount Allocated"
        value={formData.amount_allocated}
        onChange={handleChange}
      />

      <FormInput
        name="due_date"
        type="date"
        value={formData.due_date}
        onChange={handleChange}
      />

      <button type="submit" disabled={submitting || !activePeriodId}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>

      {submitError && <div className="error">{submitError}</div>}
    </form>
  );
}
