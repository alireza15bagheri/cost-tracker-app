// frontend/src/components/HeaderActions.jsx
import { useEffect, useState, useRef } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  // Close menus on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAddMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close "Add New" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Wrapper to close mobile menu after an action
  const withMobileClose = (fn) => () => {
    fn?.();
    setMobileMenuOpen(false);
  };

  // Wrapper to close desktop "Add" menu after an action
  const withDesktopAddClose = (fn) => () => {
    fn?.();
    setAddMenuOpen(false);
  };

  return (
    <>
      {/* Desktop navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <h1 className="app-logo">Cost Tracker</h1>
        </div>
        <nav className="navbar-right" aria-label="Primary actions">
          <div className="nav-dropdown-container" ref={addMenuRef}>
            <button
              className="nav-btn nav-btn--primary"
              onClick={() => setAddMenuOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={addMenuOpen}
            >
              Add New...
            </button>
            {addMenuOpen && (
              <ul className="nav-dropdown">
                <li><button onClick={withDesktopAddClose(toggleIncomeForm)}>Income</button></li>
                <li><button onClick={withDesktopAddClose(toggleAddPeriod)}>Period</button></li>
                <li><button onClick={withDesktopAddClose(toggleAddBudget)}>Budget</button></li>
                <li><button onClick={withDesktopAddClose(toggleAddCategory)}>Category</button></li>
              </ul>
            )}
          </div>

          <button className="nav-btn nav-btn--danger" onClick={onLogout}>
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
          aria-expanded={mobileMenuOpen}
          aria-controls="actions-menu"
          onClick={() => setMobileMenuOpen((s) => !s)}
        >
          ☰ Menu
        </button>

        <ul
          id="actions-menu"
          className={`menu ${mobileMenuOpen ? 'open' : ''}`}
          role="menu"
        >
          <li role="none">
            <button role="menuitem" className="menu-item" onClick={withMobileClose(toggleIncomeForm)}>
              Add Income
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="menu-item" onClick={withMobileClose(toggleAddPeriod)}>
              Add Period
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="menu-item" onClick={withMobileClose(toggleAddBudget)}>
              Add Budget
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="menu-item" onClick={withMobileClose(toggleAddCategory)}>
              Add Category
            </button>
          </li>

          <li role="separator" className="menu-sep" />

          <li role="none">
            <button role="menuitem" className="menu-item danger" onClick={withMobileClose(onLogout)}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}