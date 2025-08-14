import React from 'react';
import { deleteIncome } from '../services/incomes';

export default function IncomeList({ incomes, onDeleted }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income?')) return;
    try {
      await deleteIncome(id);
      onDeleted?.(id);
    } catch (err) {
      console.error('Failed to delete income:', err);
      alert('Could not delete income.');
    }
  };

  return (
    <ul>
      {incomes.map((inc) => (
        <li
          key={inc.id}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>{inc.source}: {Number(inc.amount).toFixed(2)}</span>
          <button className="toggle-button" onClick={() => handleDelete(inc.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
