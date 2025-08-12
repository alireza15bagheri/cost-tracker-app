// // Dashboard page: displays income list and includes functionality to add new income

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { listIncomes } from '../services/incomes'; // GET all incomes
// import AddIncomeForm from '../components/AddIncomeForm'; // Modular form component
// import './Dashboard.css';

// export default function Dashboard() {
//   const [incomes, setIncomes] = useState([]); // Holds income data
//   const [loading, setLoading] = useState(true); // Controls loading screen
//   const [err, setErr] = useState(null); // Error handler
//   const [showForm, setShowForm] = useState(false); // Toggle income form visibility
//   const navigate = useNavigate(); // For logout redirect

//   // Fetch incomes on mount
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const data = await listIncomes();
//         if (mounted) setIncomes(data);
//       } catch (e) {
//         setErr(e?.response?.data || e.message);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false; // Clean-up function
//     };
//   }, []);

//   // Logout button clears session & redirects
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/', { replace: true });
//   };

//   // Callback passed to AddIncomeForm to update income list
//   const handleAddIncome = (newIncome) => {
//     setIncomes((prev) => [...prev, newIncome]);
//     setShowForm(false); // Hide form after submit
//   };

//   if (loading) return <p>Loading…</p>;
//   if (err) return <pre style={{ color: 'tomato' }}>{JSON.stringify(err, null, 2)}</pre>;

//   return (
//     <div className="dashboard-container">
//       <div className="button-group">
//         <button className="logout-button" onClick={handleLogout}>
//           Logout
//         </button>

//         {/* Toggle button for showing/hiding Add Income form */}
//         <button className="add-income-button" onClick={() => setShowForm((s) => !s)}>
//           {showForm ? 'Cancel' : 'Add Income'}
//         </button>
//       </div>

//       {/* Conditional rendering of form */}
//       {showForm && <AddIncomeForm onAddIncome={handleAddIncome} />}

//       <h2>Your incomes</h2>
//       <ul>
//         {incomes.map((inc) => (
//           <li key={inc.id}>
//             {inc.source}: {inc.amount}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listIncomes } from '../services/incomes';
import { listPeriods } from '../services/periods';
import AddIncomeForm from '../components/AddIncomeForm';
import './Dashboard.css';

export default function Dashboard() {
  const [periods, setPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);

  const [allIncomes, setAllIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  // Load periods first, then set a default active period
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ps = await listPeriods();
        if (!mounted) return;

        setPeriods(ps || []);

        // Default selection:
        // 1) if any has is_active true
        // 2) otherwise pick the last by id (assuming latest)
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

  // Load incomes whenever activePeriodId changes
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
        // Prefer server-side filtering if supported: /incomes/?period=ID
        const serverFiltered = await listIncomes({ period: activePeriodId });
        if (!mounted) return;
        setAllIncomes(serverFiltered);
      } catch (e) {
        // Fallback: try fetching all then filter client-side
        try {
          const all = await listIncomes();
          if (!mounted) return;
          const filtered = (all || []).filter((i) => {
            // backend may return period as id or object
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleAddIncome = (newIncome) => {
    // Only append if it belongs to current active period
    const pid = typeof newIncome.period === 'object' ? newIncome.period?.id : newIncome.period;
    if (Number(pid) === Number(activePeriodId)) {
      setAllIncomes((prev) => [...prev, newIncome]);
    }
    setShowForm(false);
  };

  const incomes = useMemo(() => {
    // already filtered by fetch, but keep memo in case UI transforms are needed
    return allIncomes;
  }, [allIncomes]);

  return (
    <div className="dashboard-container">
      <div className="button-group">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <button className="add-income-button" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Add Income'}
        </button>
      </div>

      {/* Active period selector */}
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

      {/* Conditional form; it will use activePeriodId internally */}
      {showForm && <AddIncomeForm onAddIncome={handleAddIncome} activePeriodId={activePeriodId} />}

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
        </>
      )}
    </div>
  );
}
