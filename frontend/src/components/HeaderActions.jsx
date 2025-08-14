// frontend/src/components/HeaderActions.jsx
import { useEffect, useState } from 'react';

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
  const [open, setOpen] = useState(false);

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close menu after clicking any action
  const withClose = (fn) => () => {
    fn?.();
    setOpen(false);
  };

  return (
    <nav className="actions-nav">
      {/* Mobile / small screens: hamburger menu */}
      <button
        type="button"
        className="menu-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="actions-menu"
        onClick={() => setOpen((s) => !s)}
      >
        ☰ Menu
      </button>

      <ul
        id="actions-menu"
        className={`menu ${open ? 'open' : ''}`}
        role="menu"
      >
        <li role="none">
          <button
            role="menuitem"
            className="menu-item"
            onClick={withClose(toggleIncomeForm)}
            aria-pressed={!!showIncomeForm}
          >
            {showIncomeForm ? 'Cancel add income' : 'Add income'}
          </button>
        </li>
        <li role="none">
          <button
            role="menuitem"
            className="menu-item"
            onClick={withClose(toggleAddPeriod)}
            aria-pressed={!!showAddPeriod}
          >
            {showAddPeriod ? 'Cancel add period' : 'Add period'}
          </button>
        </li>
        <li role="none">
          <button
            role="menuitem"
            className="menu-item"
            onClick={withClose(toggleAddBudget)}
            aria-pressed={!!showAddBudget}
          >
            {showAddBudget ? 'Cancel add budget' : 'Add budget'}
          </button>
        </li>
        <li role="none">
          <button
            role="menuitem"
            className="menu-item"
            onClick={withClose(toggleAddCategory)}
            aria-pressed={!!showAddCategory}
          >
            {showAddCategory ? 'Cancel add category' : 'Add category'}
          </button>
        </li>

        <li role="separator" className="menu-sep" />

        <li role="none">
          <button
            role="menuitem"
            className="menu-item danger"
            onClick={withClose(onLogout)}
          >
            Logout
          </button>
        </li>
      </ul>

      {/* Desktop / large screens: inline buttons */}
      <div className="actions-inline">
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
    </nav>
  );
}
