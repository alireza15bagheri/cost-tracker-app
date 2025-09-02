// /home/alireza/cost-tracker/frontend/src/components/AddPeriodForm.jsx
import { useState } from 'react';
import { createPeriod } from '../services/periods';
import FormInput from '../components/FormInput'; // Import reusable input
import '../styles/FormStyles.css';

export default function AddPeriodForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newPeriod = await createPeriod({
        name,
        start_date: startDate,
        end_date: endDate
      });
      onSuccess?.(newPeriod);
      setName('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(err.message || 'Failed to create period');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="app-form">
      <h3>Add New Period</h3>
      {error && <p className="error">{error}</p>}

      <FormInput
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (e.g. Farvardin 1404)"
      />
      <FormInput
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <FormInput
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button type="submit">Create Period</button>
    </form>
  );
}