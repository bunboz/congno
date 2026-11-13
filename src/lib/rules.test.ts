import { describe, expect, it } from 'vitest';
import { addRule, approvalLevel, lossRate, validateRule, type Rule } from './rules';

const mk = (o: Partial<Rule>): Rule => ({
  id: 'r', debtAccountCode: '100003', customerCode: '100003', material: 'GOLD', productionFineness: 61,
  deliveryFineness: 62, lossRate: 1, effectiveFrom: '2026-01-01', effectiveTo: null, approvalReason: null,
  approvedRole: null, isActive: true, note: '', updatedBy: 'x', updatedAt: 't', ...o,
});

describe('lossRate / approvalLevel', () => {
  it('hao lai = giao - kho', () => {
    expect(lossRate(61, 62)).toBe(1);
    expect(lossRate(61, 61)).toBe(0);
    expect(lossRate(62, 61)).toBe(-1);
    expect(lossRate(61.1, 62.2)).toBe(1.1);
  });
  it('cấp duyệt', () => {
    expect(approvalLevel(1)).toBe('NONE');
    expect(approvalLevel(0)).toBe('NONE');
    expect(approvalLevel(-1)).toBe('KTT');
    expect(approvalLevel(-1.01)).toBe('BOD');
  });
});

describe('validateRule', () => {
  const ok = { production: 61, delivery: 62, reason: '', effectiveFrom: '2026-01-01', effectiveTo: null };
  it('hợp lệ', () => expect(validateRule(ok)).toEqual({}));
  it('tuổi ngoài (0,100]', () => {
    const m = 'Tuổi kim loại phải lớn hơn 0% và không vượt quá 100.00%';
    expect(validateRule({ ...ok, production: 0 }).production).toBe(m);
    expect(validateRule({ ...ok, delivery: 100.5 }).delivery).toBe(m);
    expect(validateRule({ ...ok, delivery: 'abc' }).delivery).toBe(m);
  });
  it('hao lai âm cần lý do >= 20 ký tự', () => {
    const neg = { ...ok, production: 62, delivery: 61 };
    expect(validateRule({ ...neg, reason: 'a'.repeat(19) }).reason).toBe('Lý do duyệt ngoại lệ tối thiểu 20 ký tự');
    expect(validateRule({ ...neg, reason: 'a'.repeat(20) }).reason).toBeUndefined();
    expect(validateRule({ ...ok, reason: '' }).reason).toBeUndefined();
  });
  it('ngày kết thúc trước ngày bắt đầu', () => {
    expect(validateRule({ ...ok, effectiveTo: '2025-12-31' }).date).toBeTruthy();
  });
});

describe('addRule', () => {
  const old = mk({ id: 'old' });
  it('quy ước mới chốt quy ước cũ ở D-1', () => {
    const r = addRule([old], mk({ id: 'new', deliveryFineness: 62.5, effectiveFrom: '2026-11-15' }));
    if ('error' in r) throw new Error(r.error);
    expect(r.rules.find((x) => x.id === 'old')!.effectiveTo).toBe('2026-11-14');
    expect(r.rules.find((x) => x.id === 'new')!.effectiveTo).toBeNull();
  });
  it('ngày bắt đầu trùng hoặc trước quy ước đang mở bị chặn', () => {
    expect('error' in addRule([old], mk({ id: 'n', effectiveFrom: '2026-01-01' }))).toBe(true);
    expect('error' in addRule([old], mk({ id: 'n', effectiveFrom: '2025-06-01' }))).toBe(true);
  });
  it('khác tuổi kho thì không đụng quy ước cũ', () => {
    const r = addRule([old], mk({ id: 'n', productionFineness: 71, effectiveFrom: '2026-02-01' }));
    if ('error' in r) throw new Error(r.error);
    expect(r.rules.find((x) => x.id === 'old')!.effectiveTo).toBeNull();
    expect(r.rules).toHaveLength(2);
  });
  it('chồng với quy ước đã đóng bị chặn', () => {
    const closed = mk({ id: 'c', effectiveFrom: '2026-01-01', effectiveTo: '2026-06-30' });
    expect('error' in addRule([closed], mk({ id: 'n', effectiveFrom: '2026-03-01' }))).toBe(true);
    expect('error' in addRule([closed], mk({ id: 'n', effectiveFrom: '2026-07-01' }))).toBe(false);
  });
});
