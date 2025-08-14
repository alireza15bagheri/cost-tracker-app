import React from 'react';
import { deleteBudget } from '../services/budgets';
import { formatAmount } from '../utils/format';

export default function BudgetList({ budgets, onDeleted, onToggleStatus, updatingBudget }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      onDeleted?.(id);
    } catch (err) {
      console.error('Failed to delete budget:', err);
      alert('Could not delete budget.');
    }
  };

  return (
    <ul>
      {budgets.map((b) => (
        <li
          key={b.id}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>
            {b.category?.name || `Category ${b.category}`} — {formatAmount(b.amount_allocated)} ({b.status})
          </span>
          <button
            className="toggle-button"
            disabled={!!updatingBudget?.[b.id]}
            onClick={() => onToggleStatus?.(b.id, b.status)}
          >
            {updatingBudget?.[b.id]
              ? 'Updating…'
              : b.status === 'paid'
              ? 'Mark as not paid'
              : 'Mark as paid'}
          </button>
          <button className="toggle-button" onClick={() => handleDelete(b.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
