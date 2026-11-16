import { describe, expect, it } from 'vitest';
import { convertBalance, parseNum, upgradeVersion, validateFineness, validateUpgrade } from './fineness';
import type { DebtAccount } from './types';

const ERR = 'Tuổi đối chiếu phải lớn hơn 0% và không vượt quá 100.00%';

describe('validateFineness', () => {
  it('chấp nhận 61, 100, 33.3, 99.99', () => {
    for (const v of [61, 100, 33.3, 99.99]) expect(validateFineness(v, 'đối chiếu')).toBeNull();
  });
  it('chặn 0, âm, >100, NaN, rỗng, chữ, dấu phẩy', () => {
    for (const v of [0, -1, 100.01, NaN, '', 'abc', '6,1,5', '61.5.2', '61,']) expect(validateFineness(v, 'đối chiếu')).toBe(ERR);
  });
  it('chấp nhận dấu phẩy thập phân kiểu Việt: 61,5 = 61.5', () => {
    expect(validateFineness('61,5', 'đối chiếu')).toBeNull();
    expect(parseNum('61,5')).toBe(61.5);
    expect(parseNum('62.5')).toBe(62.5);
  });
  it('nhãn kim loại cho US-04', () => {
    expect(validateFineness(0, 'kim loại')).toBe('Tuổi kim loại phải lớn hơn 0% và không vượt quá 100.00%');
  });
});

describe('convertBalance', () => {
  it('62 -> 100 bảo toàn 24K', () => {
    const r = convertBalance({ goldDelivered: 15.367, goldPending: 2.35, labor: 89500000 }, 62, 100);
    expect(r).toEqual({ goldDelivered: 9.5275, goldPending: 1.457, labor: 89500000 });
    expect(Math.abs((15.367 * 62) / 100 - (r.goldDelivered * 100) / 100)).toBeLessThan(0.0001);
  });
});

describe('validateUpgrade', () => {
  it('tuổi mới bằng tuổi hiện tại bị chặn', () => {
    expect(validateUpgrade(62, 62, 'Nâng tuổi theo phụ lục', '2026-11-12', '2026-01-01').fineness).toBe('Tuổi mới phải khác tuổi hiện tại');
  });
  it('lý do < 6 ký tự bị chặn', () => {
    expect(validateUpgrade(62, 100, 'abcde', '2026-11-12', '2026-01-01').reason).toBe('Lý do thay đổi tối thiểu 6 ký tự');
  });
  it('ngày hiệu lực không sau version hiện tại bị chặn', () => {
    expect(validateUpgrade(62, 100, 'Nâng tuổi theo phụ lục', '2026-01-01', '2026-01-01').date)
      .toBe('Ngày hiệu lực phải sau ngày hiệu lực của phiên bản hiện tại');
  });
  it('hợp lệ trả {}', () => {
    expect(validateUpgrade(62, 100, 'Nâng tuổi theo phụ lục', '2026-11-12', '2026-01-01')).toEqual({});
  });
});

const acc: DebtAccount = {
  id: 'a', code: '100003', customerCode: '100003', customerName: 'HÒA HIẾU', customerCompany: 'CÔNG TY HÒA HIẾU',
  channel: 'B2B', material: 'GOLD', uom: 'LUONG', fineness: 62, version: 2, status: 'ACTIVE', isActive: true,
  journalEntryCount: 5, note: '', effectiveFrom: '2026-01-01',
  history: [{ version: 1, code: '100003', fineness: 61, delta: null, effectiveFrom: '2025-11-05', effectiveTo: '2025-12-31', createdBy: 'x', createdAt: 't', note: '' }],
  balance: { goldDelivered: 15.367, goldPending: 2.35, labor: 89500000 }, modifiedBy: 'x', modifiedAt: 't',
};

describe('upgradeVersion', () => {
  it('v2 62% -> v3 100%', () => {
    const r = upgradeVersion(acc, 100, '2026-11-12', 'Nâng tuổi theo Phụ lục', 'Nguyễn Thị Mỹ Dung (04144)', '2026-11-12T14:30:00Z');
    expect(r.version).toBe(3);
    expect(r.fineness).toBe(100);
    expect(r.status).toBe('ACTIVE');
    expect(r.effectiveFrom).toBe('2026-11-12');
    expect(r.history).toHaveLength(2);
    const v2 = r.history.find((h) => h.version === 2)!;
    expect(v2.effectiveTo).toBe('2026-11-11');
    expect(v2.fineness).toBe(62);
    expect(r.balance.goldDelivered).toBe(9.5275);
    expect(r.journalEntryCount).toBe(5);
  });
});
