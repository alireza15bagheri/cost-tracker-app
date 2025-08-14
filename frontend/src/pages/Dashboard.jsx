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

  // Determine the active period object so we can pass its default_daily_limit
  const activePeriod = periods.find((p) => p.id === activePeriodId);

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
          {activePeriodId ? (
            <DailyHouseSpendings
              periodId={activePeriodId}
              defaultDailyLimit={activePeriod?.default_daily_limit}
            />
          ) : (
            <p>Please select a period to view daily house spendings.</p>
          )}
        </>
      )}
    </div>
  );
}
