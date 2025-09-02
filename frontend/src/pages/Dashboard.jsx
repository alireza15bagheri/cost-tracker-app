// /home/alireza/cost-tracker/frontend/src/pages/Dashboard.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { clearAccessToken } from '../services/api';
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
import PeriodNotes from '../components/PeriodNotes';
import useActivePeriod from '../hooks/useActivePeriod';
import useIncomes from '../hooks/useIncomes';
import useBudgets from '../hooks/useBudgets';
import useMiscellaneousCosts from '../hooks/useMiscellaneousCosts';
import MiscellaneousCosts from '../components/MiscellaneousCosts';
import { formatAmount } from '../utils/format';
import Modal from '../components/Modal';
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
  const {
    miscCosts,
    loadingMiscCosts,
    errorMiscCosts,
    addMiscCost,
    removeMiscCost,
  } = useMiscellaneousCosts(activePeriodId);

  const loading = loadingPeriods || loadingIncomes || loadingBudgets || loadingMiscCosts;
  const err = errorPeriods || errorIncomes || errorBudgets || errorMiscCosts;

  const handleLogout = async () => {
    try { await api.post('logout/'); } catch (_) {}
    clearAccessToken();
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

  const toggleIncomeFormSafe = () => {
    if (!activePeriodId) {
      alert('Please select a period first.');
      return;
    }
    setShowIncomeForm(s => !s);
  };

  const toggleAddBudgetSafe = () => {
    if (!activePeriodId) {
      alert('Please select a period first.');
      return;
    }
    setShowAddBudget(s => !s);
  };

  const toggleAddCategorySafe = () => {
    if (!activePeriodId) {
      alert('Please select a period first.');
      return;
    }
    setShowAddCategory(s => !s);
  };

  const memoIncomes = useMemo(() => incomes, [incomes]);
  const memoBudgets = useMemo(() => budgets, [budgets]);
  const memoMiscCosts = useMemo(() => miscCosts, [miscCosts]);

  const activePeriod = periods.find((p) => p.id === activePeriodId);
  const periodDays = activePeriod
    ? ((new Date(activePeriod.end_date) - new Date(activePeriod.start_date)) / (1000 * 60 * 60 * 24)) + 1
    : 0;
  const totalDefaultDaily = activePeriod?.default_daily_limit != null
    ? Number(activePeriod.default_daily_limit) * periodDays
    : null;
  const leftAfterBudgets =
    memoIncomes.reduce((sum, inc) => sum + Number(inc?.amount || 0), 0) -
    memoBudgets.reduce((sum, b) => sum + Number(b?.amount_allocated || 0), 0);

  const diffFromLeftover = totalDefaultDaily != null
    ? leftAfterBudgets - totalDefaultDaily
    : null;

  const totalMiscCosts = memoMiscCosts.reduce((sum, cost) => sum + Number(cost.amount || 0), 0);
  
  const finalRemaining = diffFromLeftover != null ? diffFromLeftover - totalMiscCosts : null;

  const diffColor = finalRemaining >= 0 ? '#16a34a' : '#dc2626';

  const handleNotesSaved = (updatedPeriod) => {
    setPeriods((prev) => prev.map(p => (p.id === updatedPeriod.id ? updatedPeriod : p)));
  };

  return (
    <div className="dashboard-container">
      <HeaderActions
        onLogout={handleLogout}
        showIncomeForm={showIncomeForm}
        toggleIncomeForm={toggleIncomeFormSafe}
        showAddPeriod={showAddPeriod}
        toggleAddPeriod={() => setShowAddPeriod((s) => !s)}
        showAddBudget={showAddBudget}
        toggleAddBudget={toggleAddBudgetSafe}
        showAddCategory={showAddCategory}
        toggleAddCategory={toggleAddCategorySafe}
      />

      <PeriodSelector
        periods={periods}
        value={activePeriodId}
        onChange={setActivePeriodId}
        onDelete={deleteActivePeriod}
        deleting={deletingPeriod}
      />

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

              {diffFromLeftover != null && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  Left after budgets − (Default daily limit × period days) = {formatAmount(diffFromLeftover)}
                </div>
              )}
            </>
          ) : (
            <p>Please select a period to view daily house spendings.</p>
          )}
          
          {activePeriodId && (
            <>
              <h2 style={{marginTop: '2rem'}}>Miscellaneous Costs</h2>
              <MiscellaneousCosts 
                periodId={activePeriodId}
                costs={memoMiscCosts}
                onCostAdded={addMiscCost}
                onCostDeleted={removeMiscCost}
              />
              {finalRemaining != null && (
                 <div
                  style={{
                    marginTop: '0.5rem',
                    fontWeight: 700,
                    color: diffColor,
                    fontSize: '1.1rem'
                  }}
                >
                  REMAINING AMOUNT: {formatAmount(finalRemaining)}
                </div>
              )}
            </>
          )}

          {activePeriodId ? (
            <PeriodNotes period={activePeriod} onSaved={handleNotesSaved} />
          ) : null}
        </>
      )}

      {/* Modals */}
      <Modal
        open={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        title="Add income"
        width={520}
      >
        <AddIncomeForm onAddIncome={handleAddIncome} activePeriodId={activePeriodId} />
      </Modal>

      <Modal
        open={showAddPeriod}
        onClose={() => setShowAddPeriod(false)}
        title="Add period"
        width={520}
      >
        <AddPeriodForm onSuccess={handleAddPeriod} />
      </Modal>

      <Modal
        open={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        title="Add budget"
        width={520}
      >
        {activePeriodId ? (
          <AddBudgetForm activePeriodId={activePeriodId} onAddBudget={handleAddBudget} />
        ) : (
          <p>Please select an active period first.</p>
        )}
      </Modal>

      <Modal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add category"
        width={520}
      >
        <AddCategoryForm onAddCategory={handleAddCategory} />
      </Modal>
    </div>
  );
}