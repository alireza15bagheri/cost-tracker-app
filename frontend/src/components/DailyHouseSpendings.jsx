// /home/alireza/cost-tracker/frontend/src/components/DailyHouseSpendings.jsx
import React, { useEffect, useState } from 'react';
import {
  listDailyHouseSpendings,
  createDailyHouseSpending,
  deleteDailyHouseSpending,
} from '../services/dailyHouseSpendings';
import { formatAmount } from '../utils/format';
import FormInput from './FormInput';

// Helper to format date as yyyy-mm-dd (Gregorian/US)
function toAmericanDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function DailyHouseSpendings({ periodId, defaultDailyLimit }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    date: '',
    spent_amount: '',
    fixed_daily_limit: defaultDailyLimit || '',
  });

  useEffect(() => {
    setForm((f) => ({
      ...f,
      fixed_daily_limit: defaultDailyLimit || '',
    }));
  }, [defaultDailyLimit]);

  useEffect(() => {
    if (!periodId) {
      setEntries([]);
      return;
    }
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodId]);

  const normalizeListPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  const fetchEntries = async () => {
    setLoading(true);
    setErr(null);
    try {
      const response = await listDailyHouseSpendings({ period: periodId });
      const data = normalizeListPayload(response?.data);
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

    const exists = entries.some((x) => x.date === form.date);
    if (exists) {
      setErr('You already have an entry for this date in this period.');
      return;
    }

    try {
      await createDailyHouseSpending({
        date: form.date,
        period: periodId,
        spent_amount: Number(form.spent_amount),
        fixed_daily_limit: Number(form.fixed_daily_limit),
      });
      setForm({ date: '', spent_amount: '', fixed_daily_limit: form.fixed_daily_limit });
      await fetchEntries();
    } catch (e2) {
      console.error('Failed to create entry', e2);
      const apiErr = e2?.response?.data;
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

  const handleDelete = async (id) => {
    const ok = window.confirm(
      'Delete this daily spending entry? This may affect carryover/remaining for subsequent days.'
    );
    if (!ok) return;

    setErr(null);
    setDeletingId(id);
    try {
      await deleteDailyHouseSpending(id);
      await fetchEntries();
    } catch (e) {
      console.error('Failed to delete entry', e);
      setErr(e?.response?.data || e.message || 'Failed to delete entry');
    } finally {
      setDeletingId(null);
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

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <fieldset>
          <legend>Add New Spending</legend>
          <FormInput
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <FormInput
            type="number"
            name="spent_amount"
            step="0.01"
            value={form.spent_amount}
            onChange={handleChange}
            placeholder="Spent Amount"
            required
          />
          <FormInput
            type="number"
            name="fixed_daily_limit"
            step="0.01"
            value={form.fixed_daily_limit}
            onChange={handleChange}
            placeholder="Daily Limit"
            required
          />
          <button type="submit" className="toggle-button success">
            Save Entry
          </button>
         </fieldset>
      </form>

      {!loading && !hasEntries && <p style={{ marginTop: '1rem' }}>No entries yet.</p>}

      {!loading && hasEntries && (
        <div className="table-container" style={{marginTop: '2rem'}}>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Date</th>
                <th style={{ textAlign: 'right' }}>Spent</th>
                <th style={{ textAlign: 'right' }}>Limit</th>
                <th style={{ textAlign: 'right' }}>Carryover</th>
                <th style={{ textAlign: 'right' }}>Remaining</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{toAmericanDate(e.date)}</td>
                   <td style={{ textAlign: 'right' }}>{formatAmount(e.spent_amount)}</td>
                  <td style={{ textAlign: 'right' }}>{formatAmount(e.fixed_daily_limit)}</td>
                  <td style={{ textAlign: 'right' }}>{formatAmount(e.carryover)}</td>
                  <td style={{ textAlign: 'right' }}>{formatAmount(e.remaining_for_day)}</td>
                   <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="toggle-button danger"
                      title="Delete this entry"
                       aria-label={`Delete entry for ${e.date}`}
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                      style={{ minWidth: 32 }}
                     >
                      {deletingId === e.id ? '…' : '✕'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyHouseSpendings;