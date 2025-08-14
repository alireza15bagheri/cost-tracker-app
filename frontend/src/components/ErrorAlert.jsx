export default function ErrorAlert({ error }) {
  if (!error) return null;
  return <pre style={{ color: 'tomato' }}>{JSON.stringify(error, null, 2)}</pre>;
}