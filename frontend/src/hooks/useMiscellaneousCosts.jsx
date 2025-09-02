// /home/alireza/cost-tracker/frontend/src/hooks/useMiscellaneousCosts.jsx
import { useEffect, useState } from 'react';
import { listMiscellaneousCosts } from '../services/miscellaneousCosts';

export default function useMiscellaneousCosts(activePeriodId) {
  const [miscCosts, setMiscCosts] = useState([]);
  const [loadingMiscCosts, setLoading] = useState(true);
  const [errorMiscCosts, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activePeriodId) {
        setMiscCosts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listMiscellaneousCosts({ period: activePeriodId });
        if (!mounted) return;
        setMiscCosts(data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activePeriodId]);

  const addMiscCost = (newCost) => {
    const pid = typeof newCost.period === 'object' ? newCost.period?.id : newCost.period;
    if (Number(pid) === Number(activePeriodId)) {
      setMiscCosts((prev) => [...prev, newCost]);
    }
  };

  const removeMiscCost = (id) => {
    setMiscCosts((prev) => prev.filter((c) => c.id !== id));
  };

  return { miscCosts, setMiscCosts, loadingMiscCosts, errorMiscCosts, addMiscCost, removeMiscCost };
}