import { useEffect, useState } from 'react';
import { listIncomes } from '../services/incomes';

export default function Dashboard() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listIncomes();
        if (mounted) setIncomes(data);
      } catch (e) {
        setErr(e?.response?.data || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (err) return <pre style={{ color: 'tomato' }}>{JSON.stringify(err, null, 2)}</pre>;

  return (
    <div>
      <h2>Your incomes</h2>
      <ul>
        {incomes.map((inc) => (
          <li key={inc.id}>{inc.source}: {inc.amount}</li>
        ))}
      </ul>
    </div>
  );
}
