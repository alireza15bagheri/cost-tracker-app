// frontend/src/hooks/useActivePeriod.js
import { useEffect, useState } from 'react';
import { listPeriods, deletePeriod } from '../services/periods';

export default function useActivePeriod() {
  const [periods, setPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [loadingPeriods, setLoading] = useState(true);
  const [errorPeriods, setError] = useState(null);
  const [deletingPeriod, setDeletingPeriod] = useState(false); // deletion state

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ps = await listPeriods();
        if (!mounted) return;
        setPeriods(ps || []);

        // Prefer server-marked active; otherwise last created
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

  /**
   * Delete currently active period and cascade updates to local state.
   */
  const deleteActivePeriod = async () => {
    if (!activePeriodId) return;

    const confirmDelete = window.confirm(
      'Delete this period and all related data (incomes, budgets, spendings)?'
    );
    if (!confirmDelete) return;

    setDeletingPeriod(true);
    setError(null);
    try {
      await deletePeriod(activePeriodId);

      // Remove deleted period from the list and choose next active
      setPeriods((prev) => {
        const updated = prev.filter((p) => p.id !== activePeriodId);
        const nextId = updated.length ? updated[updated.length - 1].id : null;
        setActivePeriodId(nextId);
        return updated;
      });
    } catch (e) {
      setError(e?.response?.data || e.message || 'Failed to delete period');
    } finally {
      setDeletingPeriod(false);
    }
  };

  return {
    periods,
    setPeriods,
    activePeriodId,
    setActivePeriodId,
    loadingPeriods,
    errorPeriods,
    deletingPeriod,     // expose deletion state
    deleteActivePeriod, // expose deletion handler
  };
}
