import { NO_BA_TEXT } from './format';
import { dayBefore, parseNum, validateFineness } from './fineness';

export interface Rule {
  id: string; debtAccountCode: string; customerCode: string; material: 'GOLD' | 'SILVER';
  productionFineness: number; deliveryFineness: number; lossRate: number;
  effectiveFrom: string; effectiveTo: string | null;
  approvalReason: string | null; approvedRole: 'KTT' | 'BOD' | null;
  isActive: boolean; note: string; updatedBy: string; updatedAt: string;
}

export const lossRate = (kho: number, giao: number) => Math.round((giao - kho) * 100) / 100;

// BR-03: hao lai âm, |ΔF| <= 1.00% cần Kế toán trưởng, > 1.00% cần BOD/CFO.
export function approvalLevel(loss: number): 'NONE' | 'KTT' | 'BOD' {
  if (loss >= 0) return 'NONE';
  return Math.abs(loss) <= 1 ? 'KTT' : 'BOD';
}

export function validateRule(r: { production: unknown; delivery: unknown; reason: string; effectiveFrom: string; effectiveTo: string | null }) {
  const e: { production?: string; delivery?: string; reason?: string; date?: string } = {};
  const p = validateFineness(r.production, 'kim loại');
  const d = validateFineness(r.delivery, 'kim loại');
  if (p) e.production = p;
  if (d) e.delivery = d;
  if (!p && !d && lossRate(parseNum(r.production), parseNum(r.delivery)) < 0 && r.reason.trim().length < 20) {
    e.reason = NO_BA_TEXT;
  }
  if (!r.effectiveFrom) e.date = NO_BA_TEXT;
  else if (r.effectiveTo && r.effectiveTo < r.effectiveFrom) e.date = NO_BA_TEXT;
  return e;
}

// BR-02: cùng (mã đối chiếu, tuổi kho) không chồng thời gian; quy ước mở cũ tự chốt ở D-1.
export function addRule(rules: Rule[], r: Rule): { rules: Rule[] } | { error: string } {
  const clash = NO_BA_TEXT;
  const same = (x: Rule) => x.debtAccountCode === r.debtAccountCode && x.productionFineness === r.productionFineness;
  const out = rules.map((x) => {
    if (!same(x)) return x;
    if (x.effectiveTo === null) return x.effectiveFrom < r.effectiveFrom ? { ...x, effectiveTo: dayBefore(r.effectiveFrom) } : null;
    const overlap = r.effectiveFrom <= x.effectiveTo && (r.effectiveTo === null || r.effectiveTo >= x.effectiveFrom);
    return overlap ? null : x;
  });
  if (out.includes(null)) return { error: clash };
  return { rules: [...(out as Rule[]), r] };
}
