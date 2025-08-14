// frontend/src/components/PeriodSelector.jsx
export default function PeriodSelector({ periods, value, onChange }) {
  return (
    <div className="toolbar">
      <label htmlFor="active-period"><strong>Active period:</strong></label>
      <select
        id="active-period"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Select a period…</option>
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name || `Period ${p.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
