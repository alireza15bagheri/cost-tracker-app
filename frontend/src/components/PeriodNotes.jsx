// frontend/src/components/PeriodNotes.jsx
import { useEffect, useState } from 'react';
import { updatePeriod } from '../services/periods';

export default function PeriodNotes({ period, onSaved }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Sync local state when active period changes
  useEffect(() => {
    setText(period?.notes ?? '');
    setErr('');
  }, [period?.id]);

  if (!period?.id) return null;

  const handleSave = async () => {
    setErr('');
    setSaving(true);
    try {
      const updated = await updatePeriod(period.id, { notes: text });
      onSaved?.(updated);
    } catch (e) {
      setErr(e?.response?.data || e.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Notes</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write notes for this period..."
        style={{
          width: '100%',
          minHeight: 180,
          borderRadius: 8,
          border: '1px solid #d0d7de',
          padding: 12,
          fontSize: '0.95rem',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ marginTop: '0.5rem' }}>
        <button
          className="toggle-button success"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>
      {err ? (
        <pre style={{ color: 'tomato', whiteSpace: 'pre-wrap', marginTop: 8 }}>
          {typeof err === 'string' ? err : JSON.stringify(err, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
