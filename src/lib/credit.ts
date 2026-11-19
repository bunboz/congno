import { NO_BA_TEXT } from './format';
export type CreditStatus = 'SAFE' | 'WARNING' | 'OVER_GOLD' | 'OVER_SILVER' | 'OVER_LABOR';

const over = (debt: number, limit: number | null) => !!limit && limit > 0 && debt > limit;
const days = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

// Ưu tiên (tự đặt): vượt Vàng > vượt Bạc > vượt Công > Cảnh Báo > An Toàn.
export function creditStatus(i: {
  limits: { gold: number | null; silver: number | null; labor: number | null };
  debt: { gold: number; silver: number; labor: number };
  nextDueDate: string | null; today: string;
}): CreditStatus {
  if (over(i.debt.gold, i.limits.gold)) return 'OVER_GOLD';
  if (over(i.debt.silver, i.limits.silver)) return 'OVER_SILVER';
  if (over(i.debt.labor, i.limits.labor)) return 'OVER_LABOR';
  if (i.nextDueDate && days(i.today, i.nextDueDate) <= 3) return 'WARNING';
  return 'SAFE';
}

export function validateLimits(l: { gold: number | null; silver: number | null; labor: number | null; termDays: number }) {
  const e: { gold?: string; silver?: string; labor?: string; termDays?: string } = {};
  const bad = (v: number | null) => v !== null && (!Number.isFinite(v) || v < 0);
  if (bad(l.gold)) e.gold = NO_BA_TEXT;
  if (bad(l.silver)) e.silver = NO_BA_TEXT;
  if (bad(l.labor)) e.labor = NO_BA_TEXT;
  if (!Number.isInteger(l.termDays) || l.termDays < 0 || l.termDays > 365) e.termDays = NO_BA_TEXT;
  return e;
}

const D = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function three(n: number, full: boolean): string {
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10;
  const p: string[] = [];
  if (h > 0 || full) p.push(`${D[h]} trăm`);
  if (t > 1) p.push(`${D[t]} mươi`);
  else if (t === 1) p.push('mười');
  else if ((h > 0 || full) && u > 0) p.push('lẻ');
  if (u > 0) p.push(t > 1 && u === 1 ? 'mốt' : t > 0 && u === 5 ? 'lăm' : t > 1 && u === 4 ? 'tư' : D[u]);
  return p.join(' ');
}

/** Đọc số tiền VNĐ bằng chữ (đến hàng nghìn tỷ). Số lớn hơn trả về dạng số. */
export function amountInWords(vnd: number): string {
  if (!Number.isInteger(vnd) || vnd < 0 || vnd >= 1e15) return `${vnd} đồng`;
  if (vnd === 0) return 'Không đồng';
  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ'];
  const parts: string[] = [];
  let rest = vnd, idx = 0;
  while (rest > 0) {
    const chunk = rest % 1000;
    if (chunk > 0) parts.unshift(three(chunk, rest >= 1000) + units[idx]);
    rest = Math.floor(rest / 1000);
    idx++;
  }
  const s = `${parts.join(' ')} đồng`;
  return s[0].toUpperCase() + s.slice(1);
}
