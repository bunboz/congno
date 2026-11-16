import type { Balance, DebtAccount } from './types';

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Ngày YYYY-MM-DD trừ 1 ngày, tính theo UTC để không lệch múi giờ. */
export function dayBefore(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function parseNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && /^\d+([.,]\d+)?$/.test(v.trim())) return Number(v.trim().replace(',', '.'));
  return NaN;
}

export function validateFineness(v: unknown, label: 'đối chiếu' | 'kim loại'): string | null {
  const n = parseNum(v);
  return Number.isFinite(n) && n > 0 && n <= 100 ? null : `Tuổi ${label} phải lớn hơn 0% và không vượt quá 100.00%`;
}

/** Bảo toàn vàng 24K: W_mới = W_cũ × F_cũ / F_mới. Tiền công giữ nguyên. */
export function convertBalance(b: Balance, oldF: number, newF: number): Balance {
  return {
    goldDelivered: round((b.goldDelivered * oldF) / newF, 4),
    goldPending: round((b.goldPending * oldF) / newF, 4),
    labor: b.labor,
  };
}

export function validateUpgrade(cur: number, next: unknown, reason: string, effectiveFrom: string, curFrom: string) {
  const e: { fineness?: string; reason?: string; date?: string } = {};
  const f = validateFineness(next, 'đối chiếu');
  if (f) e.fineness = f;
  else if (parseNum(next) === cur) e.fineness = 'Tuổi mới phải khác tuổi hiện tại';
  if (reason.trim().length < 6) e.reason = 'Lý do thay đổi tối thiểu 6 ký tự';
  if (!effectiveFrom || effectiveFrom <= curFrom) e.date = 'Ngày hiệu lực phải sau ngày hiệu lực của phiên bản hiện tại';
  return e;
}

export function upgradeVersion(
  acc: DebtAccount, next: number, effectiveFrom: string, reason: string, by: string, nowIso: string,
): DebtAccount {
  const prev = acc.history[acc.history.length - 1];
  const closed = {
    version: acc.version, code: acc.code, fineness: acc.fineness,
    delta: prev ? round(acc.fineness - prev.fineness, 2) : null,
    effectiveFrom: acc.effectiveFrom, effectiveTo: dayBefore(effectiveFrom),
    createdBy: acc.modifiedBy, createdAt: acc.modifiedAt, note: acc.versionNote ?? acc.note,
  };
  return {
    ...acc,
    version: acc.version + 1, fineness: next, status: 'ACTIVE', isActive: true,
    effectiveFrom, versionNote: reason, history: [...acc.history, closed],
    balance: convertBalance(acc.balance, acc.fineness, next), modifiedBy: by, modifiedAt: nowIso,
  };
}
