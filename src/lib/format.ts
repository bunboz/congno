export const num = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const pct = (n: number) => `${n.toFixed(2)}%`;
export const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
// "Tên (mã)" -> "mã - Tên", cùng kiểu cột Người tạo của ERP.
export const person = (s: string) => { const m = s.match(/^(.*) \((\d+)\)$/); return m ? `${m[2]} - ${m[1]}` : s; };
// modified_at là ISO 8601 UTC (BA); hiển thị theo giờ Việt Nam dd/mm/yyyy hh:mm.
export const dmyHm = (iso: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year} ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
};
// BA có quy tắc chặn nhưng không ghi câu thông báo: chỉ hiện ô đỏ, không viết thêm chữ (xem docs/cau-hoi-cho-BA.md).
export const NO_BA_TEXT = ' ';
