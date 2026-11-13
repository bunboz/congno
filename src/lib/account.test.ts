import { describe, expect, it } from 'vitest';
import { canCreateAccount, canDelete, defaultCode, quickCodes, toggleActive } from './account';
import type { DebtAccount, Material } from './types';

const mk = (o: Partial<DebtAccount> & { code: string; customerCode: string; material: Material }): DebtAccount => ({
  id: o.code, customerName: 'KH', customerCompany: 'CTY', channel: 'B2B', uom: 'LUONG', fineness: 62, version: 1,
  status: 'ACTIVE', isActive: true, journalEntryCount: 0, note: '', effectiveFrom: '2026-01-01', history: [],
  balance: { goldDelivered: 0, goldPending: 0, labor: 0 }, modifiedBy: 'x', modifiedAt: 't', ...o,
});

describe('canCreateAccount', () => {
  const list = [
    mk({ code: '100006', customerCode: '100006', material: 'GOLD' }),
    mk({ code: '100099_BAC', customerCode: '100099', material: 'SILVER', isActive: false, status: 'CLOSED' }),
  ];
  it('chặn trùng (KH, loại) đang active bằng câu BA', () => {
    expect(canCreateAccount(list, '100006', 'GOLD', '100006_R')).toBe(
      "Khách hàng 100006 đã có Mã đối chiếu Vàng đang hoạt động (100006). Theo quy tắc, 1 Khách hàng - 1 Loại nguyên liệu chỉ có duy nhất 1 Mã đối chiếu. Nếu muốn thay đổi tuổi thỏa thuận, vui lòng sử dụng chức năng 'Đổi Tuổi Đối Chiếu (Nâng Version)'.",
    );
  });
  it('cặp chưa có mã active thì cho tạo', () => {
    expect(canCreateAccount(list, '100006', 'SILVER', '100006_BAC')).toBeNull();
    expect(canCreateAccount(list, '100099', 'SILVER', '100099_R')).toBeNull();
  });
  it('mã trùng mã sẵn có bị chặn', () => {
    expect(canCreateAccount(list, '100099', 'SILVER', '100099_BAC')).toBe('Mã đối chiếu đã tồn tại');
  });
});

describe('mã gợi ý', () => {
  it('defaultCode theo loại', () => {
    expect(defaultCode('100006', 'GOLD')).toBe('100006');
    expect(defaultCode('100006', 'SILVER')).toBe('100006_BAC');
    expect(defaultCode('100006', 'PLATINUM')).toBe('100006_PT');
  });
  it('quickCodes', () => {
    expect(quickCodes('100006')).toEqual(['100006', '100006_R', '100006_BAC', '100006_100']);
  });
});

describe('toggleActive', () => {
  const list = [
    mk({ code: 'A', customerCode: '1', material: 'GOLD' }),
    mk({ code: 'B', customerCode: '1', material: 'GOLD', isActive: false, status: 'CLOSED' }),
  ];
  it('bật B thì A thành Ngưng hoạt động (SUPERSEDED)', () => {
    const r = toggleActive(list, 'B');
    expect(r.find((a) => a.code === 'B')).toMatchObject({ isActive: true, status: 'ACTIVE' });
    expect(r.find((a) => a.code === 'A')).toMatchObject({ isActive: false, status: 'SUPERSEDED' });
  });
  it('tắt A thì thành Tạm khóa (CLOSED)', () => {
    expect(toggleActive(list, 'A').find((a) => a.code === 'A')).toMatchObject({ isActive: false, status: 'CLOSED' });
  });
});

describe('canDelete', () => {
  it('chỉ xóa được khi 0 bút toán', () => {
    expect(canDelete(mk({ code: 'A', customerCode: '1', material: 'GOLD', journalEntryCount: 0 }))).toBe(true);
    expect(canDelete(mk({ code: 'A', customerCode: '1', material: 'GOLD', journalEntryCount: 6 }))).toBe(false);
  });
});
