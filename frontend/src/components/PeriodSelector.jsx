// frontend/src/components/PeriodSelector.jsx
/**
 * Period selector with a compact delete button for the active period.
 */
export default function PeriodSelector({
  periods,
  value,
  onChange,
  onDelete,  // new: deletion handler
  deleting = false, // new: deletion in-progress flag
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
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name || `Period ${p.id}`}
          </option>
        ))}
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
