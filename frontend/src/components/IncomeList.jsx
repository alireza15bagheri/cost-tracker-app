// /home/alireza/cost-tracker/frontend/src/components/IncomeList.jsx
import React from 'react';
import { deleteIncome } from '../services/incomes';
import { formatAmount } from '../utils/format';

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
    <ul className="item-list">
      {incomes.map((inc) => (
        <li
          key={inc.id}
        >
          <span>{inc.source}: {formatAmount(inc.amount)}</span>
          <button className="toggle-button danger" onClick={() => handleDelete(inc.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}