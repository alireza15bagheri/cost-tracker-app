// frontend/src/utils/format.js
export function formatAmount(value) {
  if (value == null || value === '' || isNaN(Number(value))) return '—';

  const num = Number(value);
  // Always two decimals for processing
  let [int, frac = ''] = num.toFixed(2).split('.');

  // Handle sign separately for formatting
  const sign = int.startsWith('-') ? '-' : '';
  if (sign) int = int.slice(1);

  // Add comma separators to integer part
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Drop .00 entirely
  if (frac === '00') {
    return sign + withCommas;
  }

  // Otherwise trim trailing zeros (e.g., .50 -> .5)
  frac = frac.replace(/0+$/, '');

  return sign + withCommas + '.' + frac;
}
