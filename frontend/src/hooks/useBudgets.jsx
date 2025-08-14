// frontend/src/hooks/useBudgets.js
import { useEffect, useState } from 'react';
import { listBudgets, updateBudgetStatus } from '../services/budgets';

export default function useBudgets(activePeriodId) {
  const [budgets, setBudgets] = useState([]);
  const [loadingBudgets, setLoading] = useState(true);
  const [errorBudgets, setError] = useState(null);
  const [updatingBudget, setUpdatingBudget] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activePeriodId) {
        setBudgets([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const serverFiltered = await listBudgets({ period: activePeriodId });
        if (!mounted) return;
        setBudgets(serverFiltered);
      } catch (e) {
        try {
          const all = await listBudgets();
          if (!mounted) return;
          const filtered = (all || []).filter((b) => {
            const pid = typeof b.period === 'object' ? b.period?.id : b.period;
            return Number(pid) === Number(activePeriodId);
          });
          setBudgets(filtered);
        } catch (e2) {
          if (!mounted) return;
          setError(e2?.response?.data || e2.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activePeriodId]);

  const addBudget = (newBudget) => {
    const pid =
      typeof newBudget.period === 'object' ? newBudget.period?.id : newBudget.period;
    if (Number(pid) === Number(activePeriodId)) {
      setBudgets((prev) => [...prev, newBudget]);
    }
  };

  const removeBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBudgetStatus = async (id, currentStatus) => {
    setUpdatingBudget((s) => ({ ...s, [id]: true }));
    const nextStatus = currentStatus === 'paid' ? 'not_paid' : 'paid';
    try {
      const updated = await updateBudgetStatus(id, nextStatus);
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      );
    } catch (error) {
      console.error('Failed to update budget status:', error);
      alert('Could not update budget status. Please try again.');
    } finally {
      setUpdatingBudget((s) => ({ ...s, [id]: false }));
    }
  };

  return {
    budgets,
    loadingBudgets,
    errorBudgets,
    updatingBudget,
    addBudget,
    removeBudget,
    toggleBudgetStatus,
  };
}
