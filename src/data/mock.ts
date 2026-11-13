import type { Channel, Customer, DebtAccount, LimitRow, Material } from '../lib/types';
import type { Rule } from '../lib/rules';

export const TODAY = '2026-11-13';
export const CURRENT_USER = 'Nguyễn Thị Mỹ Dung (04144)';
const NOW = '2026-11-13T09:00:00Z';

const core: [string, string, string, Channel][] = [
  ['100000', 'KLSAO', 'CÔNG TY TNHH KINH DOANH VÀNG BẠC KIM LOAN TUẤN', 'B2B'],
  ['100003', 'HÒA HIẾU', 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ HÒA HIẾU', 'B2B'],
  ['100004', 'ANCARAT', 'CÔNG TY CỔ PHẦN KIM LOẠI QUÝ ANCARAT', 'B2B'],
  ['100005', 'CÔNG HƯNG', 'CÔNG TY TNHH MTV VÀNG ĐÁ QUÝ CÔNG HƯNG', 'B2B'],
  ['100006', 'Tư Minh Diamond', 'CÔNG TY TNHH MTV TƯ MINH DIAMOND', 'B2B'],
  ['100007', 'KIM HÀ', 'CÔNG TY TNHH MTV QUÂN KIM HÀ', 'B2B'],
  ['100008', 'KIM HƯƠNG DINH', 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM HƯƠNG DINH', 'B2B'],
  ['100009', 'KIM MAI', 'CÔNG TY TRÁCH NHIỆM HỮU HẠN KIM MAI HÒA BÌNH', 'B2B'],
  ['100013', 'KIM SEN', 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ KIM SEN HỒNG', 'B2B'],
  ['100099', 'TƯ MINH DIAMOND', 'CÔNG TY TNHH MTV TƯ MINH DIAMOND', 'B2B'],
  ['200009', 'KIM HÀ TIÊN', 'DOANH NGHIỆP TƯ NHÂN KIM HÀ TIÊN', 'B2B2C'],
  ['200040', 'ĐẠI LÝ VÀNG BẠC TÂN ĐỊNH', 'ĐẠI LÝ VÀNG BẠC TÂN ĐỊNH', 'B2B2C'],
  ['200055', 'KIM NGỌC', 'DOANH NGHIỆP TƯ NHÂN KIM NGỌC', 'B2B2C'],
  ['200158', 'THANH DANH', 'CÔNG TY TNHH KINH DOANH VÀNG BẠC TÂN THANH DANH', 'B2B2C'],
  ['200207', 'Tiệm Vàng Tin', 'TIỆM VÀNG TIN (2 CỬA HÀNG SONG SONG)', 'B2B2C'],
  ['300001', 'ÁNH NHƯ', 'DOANH NGHIỆP TƯ NHÂN ÁNH NHƯ', 'Doanh nghiệp'],
  ['300022', 'QUỸ QUẢN LÝ VÀNG ĐỐI TÁC KHQQ', 'QUỸ QUẢN LÝ VÀNG ĐỐI TÁC KHQQ (BÊN THỨ 3)', 'Doanh nghiệp'],
  ['300046', 'PNJ', 'CÔNG TY TNHH MỘT THÀNH VIÊN CHẾ TÁC VÀ KINH DOANH TRANG SỨC PNJ', 'Doanh nghiệp'],
  ['300061', 'SJC', 'CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ SÀI GÒN - SJC', 'Doanh nghiệp'],
];

const filler: Customer[] = Array.from({ length: 30 }, (_, i) => {
  const n = String(i + 10).padStart(2, '0');
  return { code: `2000${n}`, name: `KHÁCH MẪU ${n}`, company: `CÔNG TY TNHH VÀNG BẠC MẪU ${n}`, channel: 'B2B2C' as Channel };
});

export const customers: Customer[] = [
  ...core.map(([code, name, company, channel]) => ({ code, name, company, channel })),
  ...filler,
];

const cust = (code: string) => customers.find((c) => c.code === code)!;

function acc(code: string, customerCode: string, material: Material, fineness: number, o: Partial<DebtAccount> = {}): DebtAccount {
  const c = cust(customerCode);
  return {
    id: code, code, customerCode, customerName: c.name, customerCompany: c.company, channel: c.channel,
    material, uom: 'LUONG', fineness, version: 1, status: 'ACTIVE', isActive: true, journalEntryCount: 0,
    note: '', effectiveFrom: '2026-01-01', history: [], balance: { goldDelivered: 0, goldPending: 0, labor: 0 },
    modifiedBy: CURRENT_USER, modifiedAt: NOW, ...o,
  };
}

const rec = (version: number, code: string, fineness: number, delta: number | null, from: string, to: string | null,
  by: string, at: string, note: string) => ({ version, code, fineness, delta, effectiveFrom: from, effectiveTo: to, createdBy: by, createdAt: at, note });

export const accounts: DebtAccount[] = [
  acc('100000', '100000', 'GOLD', 62, {
    version: 3, effectiveFrom: '2026-06-01', versionNote: 'Nâng tuổi theo phụ lục 06/2026',
    history: [
      rec(1, '100000', 60, null, '2025-01-01', '2025-12-31', 'Cái Trí Minh (03794)', '2025-01-01T09:15:00Z', 'Khởi tạo'),
      rec(2, '100000', 61, 1, '2026-01-01', '2026-05-31', 'Cái Trí Minh (03794)', '2026-01-01T09:15:00Z', 'Nâng tuổi theo phụ lục 01/2026'),
    ],
  }),
  acc('100003', '100003', 'GOLD', 62, {
    version: 2, effectiveFrom: '2026-11-11', journalEntryCount: 5,
    balance: { goldDelivered: 15.367, goldPending: 2.35, labor: 89500000 },
    versionNote: 'Nâng tuổi đối chiếu từ 61.00% lên 62.00% theo Phụ lục thỏa thuận kim hoàn số 11/2026/PL-SEV. Bảng cân đối công nợ cập nhật quy đổi tỷ lệ mới.',
    modifiedAt: '2026-11-11T14:30:00Z',
    history: [rec(1, '100003', 61, null, '2025-11-05', '2026-11-10', 'Cái Trí Minh (03794)', '2025-11-05T09:15:00Z', 'Khởi tạo')],
  }),
  acc('100004', '100004', 'GOLD', 62),
  acc('100005', '100005', 'GOLD', 62),
  acc('100006', '100006', 'GOLD', 61, { journalEntryCount: 6, balance: { goldDelivered: 12.854, goldPending: 0, labor: 65400000 } }),
  acc('100006_BAC', '100006', 'SILVER', 92.5),
  acc('100007', '100007', 'GOLD', 62),
  acc('100008', '100008', 'GOLD', 62),
  acc('100009', '100009', 'GOLD', 62),
  acc('100013', '100013', 'GOLD', 62),
  acc('100099', '100099', 'GOLD', 61),
  acc('100099_BAC', '100099', 'SILVER', 92.5, { isActive: false, status: 'CLOSED' }),
  acc('200009', '200009', 'GOLD', 62, { version: 2, effectiveFrom: '2026-10-01', history: [rec(1, '200009', 61, null, '2026-01-01', '2026-09-30', 'Cái Trí Minh (03794)', '2026-01-01T09:15:00Z', 'Khởi tạo')] }),
  acc('200055', '200055', 'GOLD', 62),
  ...filler.map((c) => acc(c.code, c.code, 'GOLD', 62)),
];

export const limits: LimitRow[] = [
  { customerCode: '100006', goldLimit: 60, silverLimit: 50, laborLimit: 400000000, termDays: 30, approvalNote: 'Khởi tạo hạn mức tín dụng định kỳ năm 2026', debt: { gold: 16.1798, silver: 0, labor: 88100000 }, nextDueDate: '2026-12-10' },
  { customerCode: '200055', goldLimit: 80, silverLimit: 40, laborLimit: 500000000, termDays: 15, approvalNote: '', debt: { gold: 8.9568, silver: 0, labor: 27000000 }, nextDueDate: '2026-12-01' },
  { customerCode: '100003', goldLimit: 50, silverLimit: 40, laborLimit: 300000000, termDays: 30, approvalNote: 'Khởi tạo hạn mức tín dụng định kỳ năm 2026', debt: { gold: 6.174, silver: 0, labor: 36855000 }, nextDueDate: '2026-12-05' },
  { customerCode: '200040', goldLimit: 40, silverLimit: 30, laborLimit: 200000000, termDays: 30, approvalNote: '', debt: { gold: 0, silver: 0, labor: 0 }, nextDueDate: null },
  { customerCode: '300022', goldLimit: 0, silverLimit: 0, laborLimit: 0, termDays: 0, approvalNote: 'Đối tác bán đứt', debt: { gold: 120, silver: 10, labor: 900000000 }, nextDueDate: null },
  { customerCode: '100009', goldLimit: 30, silverLimit: 20, laborLimit: 100000000, termDays: 15, approvalNote: '', debt: { gold: 0, silver: 0, labor: 0 }, nextDueDate: null },
  { customerCode: '100004', goldLimit: 20, silverLimit: 10, laborLimit: 100000000, termDays: 30, approvalNote: '', debt: { gold: 22.5, silver: 1, labor: 5000000 }, nextDueDate: '2026-12-20' },
  { customerCode: '100005', goldLimit: 20, silverLimit: 10, laborLimit: 100000000, termDays: 30, approvalNote: '', debt: { gold: 3, silver: 12.5, labor: 5000000 }, nextDueDate: '2026-12-20' },
  { customerCode: '100007', goldLimit: 20, silverLimit: 10, laborLimit: 100000000, termDays: 30, approvalNote: '', debt: { gold: 3, silver: 1, labor: 130000000 }, nextDueDate: '2026-12-20' },
  { customerCode: '100008', goldLimit: 20, silverLimit: 10, laborLimit: 100000000, termDays: 30, approvalNote: '', debt: { gold: 3, silver: 1, labor: 5000000 }, nextDueDate: '2026-11-15' },
];

const rule = (n: number, code: string, customerCode: string, material: 'GOLD' | 'SILVER', kho: number, giao: number, extra: Partial<Rule> = {}): Rule => ({
  id: `r${n}`, debtAccountCode: code, customerCode, material, productionFineness: kho, deliveryFineness: giao,
  lossRate: Math.round((giao - kho) * 100) / 100, effectiveFrom: '2026-01-01', effectiveTo: null,
  approvalReason: null, approvedRole: null, isActive: true, note: '', updatedBy: CURRENT_USER, updatedAt: NOW, ...extra,
});

export const rules: Rule[] = [
  rule(1, '100003', '100003', 'GOLD', 61, 62),
  rule(2, '100003_01', '100003', 'GOLD', 61, 62.5),
  rule(3, '100013', '100013', 'GOLD', 61, 62),
  rule(4, '100013', '100013', 'GOLD', 71, 72),
  rule(5, '100013', '100013', 'GOLD', 75, 76),
  rule(6, '200158', '200158', 'GOLD', 68, 68),
  rule(7, '300061', '300061', 'GOLD', 75, 75),
  rule(8, '300046', '300046', 'GOLD', 75, 75.2),
  rule(9, '100006', '100006', 'GOLD', 61, 62),
  rule(10, '100004', '100004', 'GOLD', 62, 63),
  rule(11, '100005', '100005', 'GOLD', 62, 61.5, { approvalReason: 'Khách hàng thỏa thuận hạ tuổi giao theo hợp đồng 05/2026', approvedRole: 'KTT' }),
  rule(12, '200055', '200055', 'GOLD', 62, 62),
  rule(13, '100006_BAC', '100006', 'SILVER', 92.5, 93),
  rule(14, '200009', '200009', 'GOLD', 61, 62, { effectiveFrom: '2025-01-01', effectiveTo: '2025-12-31' }),
];
