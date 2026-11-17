export const num = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const pct = (n: number) => `${n.toFixed(2)}%`;
export const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
// "Tên (mã)" -> "mã - Tên", cùng kiểu cột Người tạo của ERP.
export const person = (s: string) => { const m = s.match(/^(.*) \((\d+)\)$/); return m ? `${m[2]} - ${m[1]}` : s; };
export const dmyHm = (iso: string) => `${dmy(iso)} ${iso.slice(11, 16)}`;
