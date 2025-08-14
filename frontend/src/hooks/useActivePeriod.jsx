import { useEffect, useState } from 'react';
import { listPeriods } from '../services/periods';

export default function useActivePeriod() {
  const [periods, setPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [loadingPeriods, setLoading] = useState(true);
  const [errorPeriods, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ps = await listPeriods();
        if (!mounted) return;
        setPeriods(ps || []);

        let defaultId = null;
        const active = ps?.find((p) => p.is_active);
        if (active) defaultId = active.id;
        else if (ps?.length) defaultId = ps[ps.length - 1].id;

        setActivePeriodId(defaultId ?? null);
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
  }, []);

  return {
    periods,
    setPeriods,
    activePeriodId,
    setActivePeriodId,
    loadingPeriods,
    errorPeriods,
  };
}
