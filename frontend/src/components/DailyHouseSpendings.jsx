// /home/alireza/cost-tracker/frontend/src/components/DailyHouseSpendings.jsx
import React, { useEffect, useState } from 'react';
import {
  listDailyHouseSpendings,
  createDailyHouseSpending,
} from '../services/dailyHouseSpendings';

function DailyHouseSpendings({ periodId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({
    date: '',
    spent_amount: '',
    fixed_daily_limit: '',
  });

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!periodId) {
      setEntries([]);
      return;
    }
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodId]);

  const normalizeListPayload = (payload) => {
    // Accept either an array or DRF-style { results: [...] }
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  const fetchEntries = async () => {
    setLoading(true);
    setErr(null);
    try {
      const response = await listDailyHouseSpendings(accessToken, { period: periodId });
      const data = normalizeListPayload(response?.data);
      // Sort ascending by date (YYYY-MM-DD is safe lexicographically)
      const sorted = [...data].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      setEntries(sorted);
    } catch (e) {
      console.error('Failed to load daily spendings', e);
      setErr(e?.response?.data || e.message || 'Failed to load daily spendings');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    // Optional: client-side duplicate guard for same date in the same period
    const exists = entries.some((x) => x.date === form.date);
    if (exists) {
      setErr('You already have an entry for this date in this period.');
      return;
    }

    try {
      await createDailyHouseSpending(accessToken, {
        date: form.date, // YYYY-MM-DD
        period: periodId, // integer ID
        spent_amount: Number(form.spent_amount),
        fixed_daily_limit: Number(form.fixed_daily_limit),
        // IMPORTANT: do not send carryover; backend auto-fills from previous day
      });

      setForm({ date: '', spent_amount: '', fixed_daily_limit: '' });
      await fetchEntries();
    } catch (e2) {
      console.error('Failed to create entry', e2);
      const apiErr = e2?.response?.data;

      // Extract a human-readable message from DRF responses
      const message =
        apiErr?.non_field_errors?.[0] ||
        apiErr?.detail ||
        (apiErr
          ? Object.entries(apiErr)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join('\n')
          : null) ||
        e2.message ||
        'Could not save entry';

      setErr(message);
    }
  };

  const hasEntries = Array.isArray(entries) && entries.length > 0;

  return (
    <div>
      {loading && <p>Loading…</p>}
      {err && (
        <pre style={{ color: 'tomato', whiteSpace: 'pre-wrap' }}>
          {typeof err === 'string' ? err : JSON.stringify(err, null, 2)}
        </pre>
      )}

      {/* Add New Spending (above the list) */}
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <legend>Add New Spending</legend>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Date:{' '}
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Spent Amount:{' '}
              <input
                type="number"
                name="spent_amount"
                step="0.01"
                value={form.spent_amount}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Daily Limit:{' '}
              <input
                type="number"
                name="fixed_daily_limit"
                step="0.01"
                value={form.fixed_daily_limit}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <button type="submit">Save</button>
        </fieldset>
      </form>

      {/* List of spendings (below the form) */}
      {!loading && !err && !hasEntries && <p style={{ marginTop: '1rem' }}>No entries yet.</p>}

      {!loading && !err && hasEntries && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Date</th>
              <th style={{ textAlign: 'right' }}>Spent</th>
              <th style={{ textAlign: 'right' }}>Limit</th>
              <th style={{ textAlign: 'right' }}>Carryover</th>
              <th style={{ textAlign: 'right' }}>Remaining</th>
              <th style={{ textAlign: 'center' }}>Over Limit?</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td style={{ textAlign: 'right' }}>
                  {e.spent_amount != null ? Number(e.spent_amount).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {e.fixed_daily_limit != null ? Number(e.fixed_daily_limit).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {e.carryover != null ? Number(e.carryover).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {e.remaining_for_day != null ? Number(e.remaining_for_day).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'center' }}>{e.is_over_limit ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DailyHouseSpendings;
