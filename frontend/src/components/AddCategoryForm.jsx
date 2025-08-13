import { useState } from 'react';
import { createCategory } from '../services/categories';
import FormInput from '../components/FormInput';
import '../styles/FormStyles.css';

export default function AddCategoryForm({ onAddCategory }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

    if (!formData.name.trim()) {
      return setSubmitError('Name is required.');
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };
      const created = await createCategory(payload);
      onAddCategory?.(created);
      setFormData({ name: '', description: '' });
    } catch (err) {
      const data = err?.response?.data;
      setSubmitError(data?.message || JSON.stringify(data) || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="app-form" onSubmit={handleSubmit} noValidate>
      <h3>Add New Category</h3>

      <FormInput
        name="name"
        type="text"
        placeholder="Category Name"
        value={formData.name}
        onChange={handleChange}
      />

      <FormInput
        name="description"
        type="text"
        placeholder="Description (optional)"
        value={formData.description}
        onChange={handleChange}
      />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>

      {submitError && <div className="error">{submitError}</div>}
    </form>
  );
}
