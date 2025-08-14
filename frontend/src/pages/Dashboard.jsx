import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listIncomes } from '../services/incomes';
import { listBudgets } from '../services/budgets';
import { listPeriods } from '../services/periods';
import AddIncomeForm from '../components/AddIncomeForm';
import AddPeriodForm from '../components/AddPeriodForm';
import AddBudgetForm from '../components/AddBudgetForm';
import AddCategoryForm from '../components/AddCategoryForm';
import DailyHouseSpendings from '../components/DailyHouseSpendings';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [periods, setPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);

  const [allIncomes, setAllIncomes] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Track per-budget updating state to disable the toggle button
  const [updatingBudget, setUpdatingBudget] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
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
        setErr(e?.response?.data || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activePeriodId) {
        setAllIncomes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const serverFiltered = await listIncomes({ period: activePeriodId });
        if (!mounted) return;
        setAllIncomes(serverFiltered);
      } catch (e) {
        try {
          const all = await listIncomes();
          if (!mounted) return;
          const filtered = (all || []).filter((i) => {
            const pid = typeof i.period === 'object' ? i.period?.id : i.period;
            return Number(pid) === Number(activePeriodId);
          });
          setAllIncomes(filtered);
        } catch (e2) {
          if (!mounted) return;
          setErr(e2?.response?.data || e2.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activePeriodId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activePeriodId) {
        setAllBudgets([]);
        return;
      }
      try {
        const serverFiltered = await listBudgets({ period: activePeriodId });
        if (!mounted) return;
        setAllBudgets(serverFiltered);
      } catch (e) {
        try {
          const all = await listBudgets();
          if (!mounted) return;
          const filtered = (all || []).filter((b) => {
            const pid = typeof b.period === 'object' ? b.period?.id : b.period;
            return Number(pid) === Number(activePeriodId);
          });
          setAllBudgets(filtered);
        } catch (e2) {
          console.error('Failed to load budgets:', e2);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activePeriodId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleAddIncome = (newIncome) => {
    const pid = typeof newIncome.period === 'object' ? newIncome.period?.id : newIncome.period;
    if (Number(pid) === Number(activePeriodId)) {
      setAllIncomes((prev) => [...prev, newIncome]);
    }
    setShowForm(false);
  };

  const handleAddPeriod = (newPeriod) => {
    setPeriods((prev) => [...prev, newPeriod]);
    setActivePeriodId(newPeriod.id);
    setShowAddPeriod(false);
  };

  const handleAddBudget = (newBudget) => {
    const pid = typeof newBudget.period === 'object' ? newBudget.period?.id : newBudget.period;
    if (Number(pid) === Number(activePeriodId)) {
      setAllBudgets((prev) => [...prev, newBudget]);
    }
    setShowAddBudget(false);
  };

  const handleAddCategory = () => {
    setShowAddCategory(false);
  };

  // Toggle status paid <-> not_paid
  const handleToggleBudgetStatus = async (id, currentStatus) => {
    setUpdatingBudget((s) => ({ ...s, [id]: true }));
    const nextStatus = currentStatus === 'paid' ? 'not_paid' : 'paid';
    try {
      const res = await api.patch(`budgets/${id}/`, { status: nextStatus });
      const updated = res.data;
      setAllBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      );
    } catch (error) {
      console.error('Failed to update budget status:', error);
      alert('Could not update budget status. Please try again.');
    } finally {
      setUpdatingBudget((s) => ({ ...s, [id]: false }));
    }
  };

  const incomes = useMemo(() => allIncomes, [allIncomes]);
  const budgets = useMemo(() => allBudgets, [allBudgets]);

  return (
    <div className="dashboard-container">
      <div className="button-group">
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
        <button className="dashboard-button" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Add Income'}
        </button>
        <button className="dashboard-button" onClick={() => setShowAddPeriod((s) => !s)}>
          {showAddPeriod ? 'Cancel' : 'Add Period'}
        </button>
        <button className="dashboard-button" onClick={() => setShowAddBudget((s) => !s)}>
          {showAddBudget ? 'Cancel' : 'Add Budget'}
        </button>
        <button className="dashboard-button" onClick={() => setShowAddCategory((s) => !s)}>
          {showAddCategory ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAddPeriod && <AddPeriodForm onSuccess={handleAddPeriod} />}

      {showAddBudget && activePeriodId && (
        <AddBudgetForm
          activePeriodId={activePeriodId}
          onAddBudget={handleAddBudget}
        />
      )}

      {showAddCategory && <AddCategoryForm onAddCategory={handleAddCategory} />}

      <div className="toolbar">
        <label htmlFor="active-period"><strong>Active period:</strong></label>
        <select
          id="active-period"
          value={activePeriodId ?? ''}
          onChange={(e) => setActivePeriodId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Select a period…</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || `Period ${p.id}`}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <AddIncomeForm onAddIncome={handleAddIncome} activePeriodId={activePeriodId} />
      )}

      {loading && <p>Loading…</p>}
      {err && <pre style={{ color: 'tomato' }}>{JSON.stringify(err, null, 2)}</pre>}

      {!loading && !err && (
        <>
          <h2>Your incomes</h2>
          {activePeriodId ? (
            <ul>
              {incomes.map((inc) => (
                <li key={inc.id}>
                  {inc.source}: {Number(inc.amount).toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Please select a period to view incomes.</p>
          )}

          <h2>Your budgets</h2>
          {activePeriodId ? (
            <ul>
              {budgets.map((b) => (
                <li
                  key={b.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span>
                    {b.category?.name || `Category ${b.category}`} — {Number(b.amount_allocated).toFixed(2)} ({b.status})
                  </span>
                  <button
                    className="toggle-button"
                    disabled={!!updatingBudget[b.id]}
                    onClick={() => handleToggleBudgetStatus(b.id, b.status)}
                  >
                    {updatingBudget[b.id]
                      ? 'Updating…'
                      : b.status === 'paid'
                      ? 'Mark as not paid'
                      : 'Mark as paid'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Please select a period to view budgets.</p>
          )}

          <h2>Daily house spendings</h2>
          {activePeriodId ? (
            <DailyHouseSpendings periodId={activePeriodId} />
          ) : (
            <p>Please select a period to view daily house spendings.</p>
          )}
        </>
      )}
    </div>
  );
}
