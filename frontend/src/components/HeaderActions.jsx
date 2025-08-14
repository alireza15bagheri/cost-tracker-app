// frontend/src/components/HeaderActions.jsx
export default function HeaderActions({
  onLogout,
  showIncomeForm,
  toggleIncomeForm,
  showAddPeriod,
  toggleAddPeriod,
  showAddBudget,
  toggleAddBudget,
  showAddCategory,
  toggleAddCategory,
}) {
  return (
    <div className="button-group">
      <button className="dashboard-button" onClick={onLogout}>Logout</button>
      <button className="dashboard-button" onClick={toggleIncomeForm}>
        {showIncomeForm ? 'Cancel' : 'Add Income'}
      </button>
      <button className="dashboard-button" onClick={toggleAddPeriod}>
        {showAddPeriod ? 'Cancel' : 'Add Period'}
      </button>
      <button className="dashboard-button" onClick={toggleAddBudget}>
        {showAddBudget ? 'Cancel' : 'Add Budget'}
      </button>
      <button className="dashboard-button" onClick={toggleAddCategory}>
        {showAddCategory ? 'Cancel' : 'Add Category'}
      </button>
    </div>
  );
}
