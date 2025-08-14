// frontend/src/hooks/useIncomes.js
import { useEffect, useState } from 'react';
import { listIncomes } from '../services/incomes';

export default function useIncomes(activePeriodId) {
  const [incomes, setIncomes] = useState([]);
  const [loadingIncomes, setLoading] = useState(true);
  const [errorIncomes, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activePeriodId) {
        setIncomes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const serverFiltered = await listIncomes({ period: activePeriodId });
        if (!mounted) return;
        setIncomes(serverFiltered);
      } catch (e) {
        try {
          const all = await listIncomes();
          if (!mounted) return;
          const filtered = (all || []).filter((i) => {
            const pid = typeof i.period === 'object' ? i.period?.id : i.period;
            return Number(pid) === Number(activePeriodId);
          });
          setIncomes(filtered);
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

  const addIncome = (newIncome) => {
    const pid =
      typeof newIncome.period === 'object' ? newIncome.period?.id : newIncome.period;
    if (Number(pid) === Number(activePeriodId)) {
      setIncomes((prev) => [...prev, newIncome]);
    }
  };

  const removeIncome = (id) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  return { incomes, loadingIncomes, errorIncomes, addIncome, removeIncome };
}
