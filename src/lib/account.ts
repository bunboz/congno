import { MATERIAL_LABEL, type DebtAccount, type Material } from './types';

export function canCreateAccount(accounts: DebtAccount[], customerCode: string, material: Material, code: string): string | null {
  const active = accounts.find((a) => a.customerCode === customerCode && a.material === material && a.isActive);
  if (active) {
    return `Khách hàng ${customerCode} đã có Mã đối chiếu ${MATERIAL_LABEL[material]} đang hoạt động (${active.code}). Theo quy tắc, 1 Khách hàng - 1 Loại nguyên liệu chỉ có duy nhất 1 Mã đối chiếu. Nếu muốn thay đổi tuổi thỏa thuận, vui lòng sử dụng chức năng 'Đổi Tuổi Đối Chiếu (Nâng Version)'.`;
  }
  if (accounts.some((a) => a.code === code)) return 'Mã đối chiếu đã tồn tại';
  return null;
}

const SUFFIX: Record<Material, string> = { GOLD: '', SILVER: '_BAC', PLATINUM: '_PT' };
export const defaultCode = (customerCode: string, material: Material) => customerCode + SUFFIX[material];
export const quickCodes = (c: string) => [c, `${c}_R`, `${c}_BAC`, `${c}_100`];

export function toggleActive(accounts: DebtAccount[], id: string): DebtAccount[] {
  const target = accounts.find((a) => a.id === id);
  if (!target) return accounts;
  const turnOn = !target.isActive;
  return accounts.map((a) => {
    if (a.id === id) return { ...a, isActive: turnOn, status: turnOn ? 'ACTIVE' : 'CLOSED' };
    const sameBook = a.customerCode === target.customerCode && a.material === target.material;
    return turnOn && sameBook && a.isActive ? { ...a, isActive: false, status: 'SUPERSEDED' } : a;
  });
}

// BA US-01 AC-06 / BR-05: đã có bút toán thì cấm xóa.
export const canDelete = (a: DebtAccount) => a.journalEntryCount === 0;
