// frontend/src/components/PeriodSelector.jsx
/**
 * Period selector with a compact delete button for the active period.
 * Now shows the period's date range in the format: start_date - end_date
 */
export default function PeriodSelector({
  periods,
  value,
  onChange,
  onDelete,  // deletion handler
  deleting = false, // deletion in-progress flag
}) {
  return (
    <div className="toolbar">
      <label htmlFor="active-period">
        <strong>Active period:</strong>
      </label>

      <select
        id="active-period"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Select a period…</option>
        {periods.map((p) => {
          // Construct range string: YYYY-MM-DD - YYYY-MM-DD
          const range =
            p.start_date && p.end_date
              ? `${p.start_date} - ${p.end_date}`
              : '';

          return (
            <option key={p.id} value={p.id}>
              {p.name || `Period ${p.id}`} {range ? `(${range})` : ''}
            </option>
          );
        })}
      </select>

      {/* Delete button sits next to the combo box */}
      <button
        type="button"
        className="toggle-button danger"
        disabled={!value || deleting}
        onClick={onDelete}
        title="Delete this period and all associated data"
      >
        {deleting ? 'Deleting…' : 'Delete period'}
      </button>
    </div>
  );
}
