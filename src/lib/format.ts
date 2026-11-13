export const num = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const pct = (n: number) => `${n.toFixed(2)}%`;
export const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
