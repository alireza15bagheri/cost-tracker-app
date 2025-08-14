// frontend/src/components/BudgetSummary.jsx
import React, { useMemo } from 'react';
import { formatAmount } from '../utils/format';

/**
 * Shows "incomes - budgets" for the active period.
 * Computes totals internally and renders a single concise line.
 */
export default function BudgetSummary({ incomes = [], budgets = [] }) {
  const totalIncome = useMemo(
    () => incomes.reduce((sum, inc) => sum + Number(inc?.amount || 0), 0),
    [incomes]
  );

  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + Number(b?.amount_allocated || 0), 0),
    [budgets]
  );

  const leftover = totalIncome - totalBudget;
  const color = leftover < 0 ? '#dc2626' : '#16a34a'; // red if negative, green otherwise

  return (
    <div style={{ marginTop: '0.5rem', fontWeight: 700, color }}>
      Left after budgets: {formatAmount(leftover)}
    </div>
  );
}
