// frontend/src/pages/Dashboard.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIncomeForm from '../components/AddIncomeForm';
import AddPeriodForm from '../components/AddPeriodForm';
import AddBudgetForm from '../components/AddBudgetForm';
import AddCategoryForm from '../components/AddCategoryForm';
import DailyHouseSpendings from '../components/DailyHouseSpendings';
import IncomeList from '../components/IncomeList';
import BudgetList from '../components/BudgetList';
import HeaderActions from '../components/HeaderActions';
import PeriodSelector from '../components/PeriodSelector';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import BudgetSummary from '../components/BudgetSummary';
import useActivePeriod from '../hooks/useActivePeriod';
import useIncomes from '../hooks/useIncomes';
import useBudgets from '../hooks/useBudgets';
import { formatAmount } from '../utils/format';
import './Dashboard.css';

export default function Dashboard() {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const navigate = useNavigate();

  const {
    periods,
    setPeriods,
    activePeriodId,
    setActivePeriodId,
    loadingPeriods,
    errorPeriods,
    deletingPeriod,
    deleteActivePeriod,
  } = useActivePeriod();

  const {
    incomes,
    loadingIncomes,
    errorIncomes,
    addIncome,
    removeIncome,
  } = useIncomes(activePeriodId);

  const {
    budgets,
    loadingBudgets,
    errorBudgets,
    updatingBudget,
    addBudget,
    removeBudget,
    toggleBudgetStatus,
  } = useBudgets(activePeriodId);

  const loading = loadingPeriods || loadingIncomes || loadingBudgets;
  const err = errorPeriods || errorIncomes || errorBudgets;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleAddIncome = (newIncome) => {
    addIncome(newIncome);
    setShowIncomeForm(false);
  };

  const handleAddPeriod = (newPeriod) => {
    setPeriods((prev) => [...prev, newPeriod]);
    setActivePeriodId(newPeriod.id);
    setShowAddPeriod(false);
  };

  const handleAddBudget = (newBudget) => {
    addBudget(newBudget);
    setShowAddBudget(false);
  };

  const handleAddCategory = () => {
    setShowAddCategory(false);
  };

  const memoIncomes = useMemo(() => incomes, [incomes]);
  const memoBudgets = useMemo(() => budgets, [budgets]);

  const activePeriod = periods.find((p) => p.id === activePeriodId);

  // Helper calculations
  const periodDays = activePeriod
    ? ((new Date(activePeriod.end_date) - new Date(activePeriod.start_date)) /
        (1000 * 60 * 60 * 24)) + 1
    : 0;

  const totalDefaultDaily = activePeriod?.default_daily_limit != null
    ? Number(activePeriod.default_daily_limit) * periodDays
    : null;

  const leftAfterBudgets =
    memoIncomes.reduce((sum, inc) => sum + Number(inc?.amount || 0), 0) -
    memoBudgets.reduce((sum, b) => sum + Number(b?.amount_allocated || 0), 0);

  // Now: "Left after budgets − Default daily total"
  const diffFromLeftover = totalDefaultDaily != null
    ? leftAfterBudgets - totalDefaultDaily
    : null;

  // Pick color: green if ≥0, red if <0
  const diffColor = diffFromLeftover >= 0 ? '#16a34a' : '#dc2626';

  return (
    <div className="dashboard-container">
      <HeaderActions
        onLogout={handleLogout}
        showIncomeForm={showIncomeForm}
        toggleIncomeForm={() => setShowIncomeForm((s) => !s)}
        showAddPeriod={showAddPeriod}
        toggleAddPeriod={() => setShowAddPeriod((s) => !s)}
        showAddBudget={showAddBudget}
        toggleAddBudget={() => setShowAddBudget((s) => !s)}
        showAddCategory={showAddCategory}
        toggleAddCategory={() => setShowAddCategory((s) => !s)}
      />

      {showAddPeriod && <AddPeriodForm onSuccess={handleAddPeriod} />}

      {showAddBudget && activePeriodId && (
        <AddBudgetForm
          activePeriodId={activePeriodId}
          onAddBudget={handleAddBudget}
        />
      )}

      {showAddCategory && <AddCategoryForm onAddCategory={handleAddCategory} />}

      <PeriodSelector
        periods={periods}
        value={activePeriodId}
        onChange={setActivePeriodId}
        onDelete={deleteActivePeriod}
        deleting={deletingPeriod}
      />

      {showIncomeForm && (
        <AddIncomeForm
          onAddIncome={handleAddIncome}
          activePeriodId={activePeriodId}
        />
      )}

      {loading && <Loading />}
      <ErrorAlert error={err} />

      {!loading && !err && (
        <>
          <h2>Your incomes</h2>
          {activePeriodId ? (
            <IncomeList incomes={memoIncomes} onDeleted={removeIncome} />
          ) : (
            <p>Please select a period to view incomes.</p>
          )}

          <h2>Your budgets</h2>
          {activePeriodId ? (
            <>
              <BudgetList
                budgets={memoBudgets}
                updatingBudget={updatingBudget}
                onToggleStatus={toggleBudgetStatus}
                onDeleted={removeBudget}
              />
              <BudgetSummary incomes={memoIncomes} budgets={memoBudgets} />
            </>
          ) : (
            <p>Please select a period to view budgets.</p>
          )}

          <h2>Daily house spendings</h2>

          {/* Info under header */}
          {totalDefaultDaily != null && (
            <div style={{ fontStyle: 'italic', color: '#555' }}>
              Default daily limit × period days = {formatAmount(totalDefaultDaily)}
            </div>
          )}

          {activePeriodId ? (
            <>
              <DailyHouseSpendings
                periodId={activePeriodId}
                defaultDailyLimit={activePeriod?.default_daily_limit}
              />

              {/* Info under section with color coding */}
              {diffFromLeftover != null && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontWeight: 600,
                    color: diffColor,
                  }}
                >
                  Left after budgets − Default daily limit × period days = {formatAmount(diffFromLeftover)}
                </div>
              )}
            </>
          ) : (
            <p>Please select a period to view daily house spendings.</p>
          )}
        </>
      )}
    </div>
  );
}
