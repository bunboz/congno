import { describe, expect, it } from 'vitest';
import { amountInWords, creditStatus, validateLimits } from './credit';

const base = {
  limits: { gold: 50, silver: 40, labor: 300000000 },
  debt: { gold: 10, silver: 5, labor: 1000000 },
  nextDueDate: null as string | null,
  today: '2026-11-13',
};

describe('creditStatus', () => {
  it('trong hạn mức, chưa đến hạn = SAFE', () => expect(creditStatus(base)).toBe('SAFE'));
  it('nợ vàng vượt = OVER_GOLD; bằng hạn mức thì không vượt', () => {
    expect(creditStatus({ ...base, debt: { ...base.debt, gold: 50.0001 } })).toBe('OVER_GOLD');
    expect(creditStatus({ ...base, debt: { ...base.debt, gold: 50 } })).toBe('SAFE');
  });
  it('bạc, công vượt', () => {
    expect(creditStatus({ ...base, debt: { ...base.debt, silver: 41 } })).toBe('OVER_SILVER');
    expect(creditStatus({ ...base, debt: { ...base.debt, labor: 300000001 } })).toBe('OVER_LABOR');
  });
  it('ưu tiên vàng > bạc > công', () => {
    expect(creditStatus({ ...base, debt: { gold: 99, silver: 99, labor: 9e9 } })).toBe('OVER_GOLD');
    expect(creditStatus({ ...base, debt: { gold: 1, silver: 99, labor: 9e9 } })).toBe('OVER_SILVER');
  });
  it('hạn mức 0 hoặc null = không giới hạn', () => {
    expect(creditStatus({ ...base, limits: { gold: 0, silver: null, labor: 0 }, debt: { gold: 999, silver: 999, labor: 9e9 } })).toBe('SAFE');
  });
  it('còn 3 ngày = WARNING, 4 ngày = SAFE, quá hạn = WARNING', () => {
    expect(creditStatus({ ...base, nextDueDate: '2026-11-16' })).toBe('WARNING');
    expect(creditStatus({ ...base, nextDueDate: '2026-11-17' })).toBe('SAFE');
    expect(creditStatus({ ...base, nextDueDate: '2026-11-01' })).toBe('WARNING');
  });
  it('vượt hạn mức thắng cảnh báo', () => {
    expect(creditStatus({ ...base, nextDueDate: '2026-11-14', debt: { ...base.debt, gold: 60 } })).toBe('OVER_GOLD');
  });
});

describe('validateLimits', () => {
  const ok = { gold: 50, silver: null, labor: 0, termDays: 30 };
  it('hợp lệ', () => expect(validateLimits(ok)).toEqual({}));
  it('hạn mức âm', () => expect(validateLimits({ ...ok, gold: -1 }).gold).toBeTruthy());
  it('kỳ hạn 366, -1, 1.5 lỗi; 0 và 365 hợp lệ', () => {
    for (const t of [366, -1, 1.5]) expect(validateLimits({ ...ok, termDays: t }).termDays).toBeTruthy();
    for (const t of [0, 365]) expect(validateLimits({ ...ok, termDays: t }).termDays).toBeUndefined();
  });
});

describe('amountInWords', () => {
  it('đọc số tiền', () => {
    expect(amountInWords(300000000)).toBe('Ba trăm triệu đồng');
    expect(amountInWords(400000000)).toBe('Bốn trăm triệu đồng');
    expect(amountInWords(89500000)).toBe('Tám mươi chín triệu năm trăm nghìn đồng');
  });
});
