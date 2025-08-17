// frontend/src/components/HeaderActions.jsx
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

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

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close mobile menu after clicking any action
  const withClose = (fn) => () => {
    fn?.();
    setOpen(false);
  };

  return (
    <>
      {/* Desktop navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <h1 className="app-logo">Cost Tracker</h1>
        </div>
        <nav className="navbar-right" aria-label="Primary actions">
          <button className="nav-btn" onClick={toggleIncomeForm} aria-pressed={!!showIncomeForm}>
            {showIncomeForm ? 'Cancel Income' : 'Add Income'}
          </button>
          <button className="nav-btn" onClick={toggleAddPeriod} aria-pressed={!!showAddPeriod}>
            {showAddPeriod ? 'Cancel Period' : 'Add Period'}
          </button>
          <button className="nav-btn" onClick={toggleAddBudget} aria-pressed={!!showAddBudget}>
            {showAddBudget ? 'Cancel Budget' : 'Add Budget'}
          </button>
          <button className="nav-btn" onClick={toggleAddCategory} aria-pressed={!!showAddCategory}>
            {showAddCategory ? 'Cancel Category' : 'Add Category'}
          </button>
          <button className="nav-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Mobile / small screens: hamburger menu */}
      <nav className="actions-nav" aria-label="Mobile actions">
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
      </nav>
    </>
  );
}