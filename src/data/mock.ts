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
  ['400001', 'Anh Hùng Nhẫn Cưới', 'HỘ KINH DOANH ANH HÙNG VÀNG BẠC NHẪN CƯỚI', 'Vãng lai'],
  ['400002', 'Chị Lan Tiệm Chợ', 'HỘ KINH DOANH TIỆM VÀNG CHỊ LAN CHỢ BẾN THÀNH', 'Vãng lai'],
  ['400003', 'Bảo Ngọc Gold', 'CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ BẢO NGỌC GOLD JEWELRY INTERNATIONAL', 'Vãng lai'],
  ['400004', 'Phát Lộc', 'TIỆM VÀNG PHÁT LỘC', 'Vãng lai'],
  ['400005', 'Minh Châu', 'CỬA HÀNG KIM HOÀN MINH CHÂU', 'Vãng lai'],
];

const FILLER_NAMES = ['KIM PHÚC', 'NGỌC TRAI ĐÔNG Á', 'Hoàng Gia Jewelry', 'TÂM ĐỨC', 'LONG PHƯỢNG', 'Vàng Bạc Thịnh Vượng', 'KIM CƯƠNG XANH', 'AN KHANG', 'Mỹ Ngọc', 'THIÊN KIM',
  'Phú Quý Gold', 'KIM LONG', 'Bích Ngọc', 'Hưng Thịnh', 'THÀNH ĐẠT', 'Tuyết Mai', 'Ngọc Hà Nội', 'KIM THÀNH', 'Quang Minh', 'Đại Phát',
  'HẢI ANH', 'Kim Đăng', 'Trường Sơn', 'VÀNG BẠC BÌNH AN', 'Tân Hoa', 'Sao Mai', 'THANH BÌNH', 'Kim Khánh', 'Việt Gold', 'Hồng Phúc'];
const FILLER_CH: Channel[] = ['B2B', 'B2B2C', 'Doanh nghiệp', 'Vãng lai'];
const filler: Customer[] = FILLER_NAMES.map((name, i) => ({
  code: `2000${String(i + 10).padStart(2, '0')}`, name,
  company: `${i % 5 === 0 ? 'CÔNG TY CỔ PHẦN' : i % 3 === 0 ? 'DOANH NGHIỆP TƯ NHÂN' : 'CÔNG TY TNHH'} ${name.toUpperCase()}${i % 7 === 0 ? ' CHI NHÁNH MIỀN TÂY' : ''}`,
  channel: FILLER_CH[i % 4],
}));

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
  ...fillerAccounts(),
  acc('400001', '400001', 'GOLD', 75, { journalEntryCount: 3, note: 'Khách vãng lai mua nhẫn cưới theo đợt', modifiedBy: 'Lê Trung Hiếu (04162)', modifiedAt: '2026-11-05T08:20:00Z' }),
  acc('400002', '400002', 'GOLD', 99.99, { uom: 'GRAM', note: 'Giao dịch vàng miếng, tính theo gram', modifiedBy: 'Hồ Thị Mỹ Tâm (04356)', modifiedAt: '2026-10-28T15:45:00Z' }),
  acc('400003', '400003', 'GOLD', 58.5, { version: 2, effectiveFrom: '2026-09-01', journalEntryCount: 12, balance: { goldDelivered: 4.2, goldPending: 1.1, labor: 18500000 }, note: 'Chuyển sang vàng 14K theo hợp đồng mới',
    history: [rec(1, '400003', 41.6, null, '2026-01-01', '2026-08-31', 'Cù Thị Mỹ Duy (04108)', '2026-01-01T09:15:00Z', 'Khởi tạo')], modifiedBy: 'Cù Thị Mỹ Duy (04108)', modifiedAt: '2026-09-01T10:00:00Z' }),
  acc('400003_BAC', '400003', 'SILVER', 75, { isActive: false, status: 'CLOSED', note: 'Tạm khóa chờ đối chiếu công nợ cuối quý', modifiedBy: 'Tôn Tấn Khang (04127)', modifiedAt: '2026-11-10T16:30:00Z' }),
  acc('400004', '400004', 'GOLD', 33.3, { isActive: false, status: 'SUPERSEDED', version: 2, effectiveFrom: '2026-04-01', note: 'Đã thay thế bằng mã mới', modifiedBy: 'Tôn Tấn Khang (04127)', modifiedAt: '2026-04-01T09:00:00Z',
    history: [rec(1, '400004', 30, null, '2026-01-01', '2026-03-31', 'Tôn Tấn Khang (04127)', '2026-01-01T09:15:00Z', 'Khởi tạo')] }),
  acc('400005', '400005', 'GOLD', 68, { journalEntryCount: 1, modifiedBy: 'Lê Trung Hiếu (04162)', modifiedAt: '2026-11-12T11:05:00Z' }),
  acc('400005_PT', '400005', 'PLATINUM', 95, { note: 'Bạch kim đặt hàng riêng', modifiedBy: 'Lê Trung Hiếu (04162)', modifiedAt: '2026-11-12T11:10:00Z' }),
  acc('300001', '300001', 'GOLD', 75, { journalEntryCount: 24, balance: { goldDelivered: 85, goldPending: 6.2, labor: 800000000 }, note: 'Khách doanh nghiệp lớn, đối chiếu cuối tháng', modifiedBy: 'Hồ Thị Mỹ Tâm (04356)', modifiedAt: '2026-11-09T09:30:00Z' }),
  acc('300046', '300046', 'GOLD', 75, { version: 4, effectiveFrom: '2026-08-01', journalEntryCount: 40, note: 'Tuổi điều chỉnh nhiều lần theo phụ lục',
    history: [
      rec(1, '300046', 70, null, '2025-01-01', '2025-06-30', 'Cái Trí Minh (03794)', '2025-01-01T09:15:00Z', 'Khởi tạo'),
      rec(2, '300046', 72, 2, '2025-07-01', '2026-01-31', 'Cái Trí Minh (03794)', '2025-07-01T09:15:00Z', 'Nâng tuổi theo phụ lục 07/2025'),
      rec(3, '300046', 74, 2, '2026-02-01', '2026-07-31', 'Cù Thị Mỹ Duy (04108)', '2026-02-01T09:15:00Z', 'Nâng tuổi theo phụ lục 02/2026'),
    ], modifiedBy: 'Cù Thị Mỹ Duy (04108)', modifiedAt: '2026-08-01T09:00:00Z' }),
  acc('300061', '300061', 'GOLD', 75, { journalEntryCount: 58, note: 'Tập đoàn, đối chiếu theo tuần' }),
  acc('300061_BAC', '300061', 'SILVER', 99.9, { journalEntryCount: 7 }),
];

function fillerAccounts(): DebtAccount[] {
  const FIN = [62, 61, 75, 99.99, 58.5, 41.6, 92.5, 33.3, 68, 100];
  const NOTES = ['', '', 'Khách mới mở sổ quý 4', '', 'Thỏa thuận hợp đồng khung 2026', '', '', 'Đối chiếu cuối tháng', '', 'Chờ bổ sung phụ lục'];
  const WHO = ['Cái Trí Minh (03794)', 'Lê Trung Hiếu (04162)', 'Cù Thị Mỹ Duy (04108)', 'Tôn Tấn Khang (04127)', 'Hồ Thị Mỹ Tâm (04356)'];
  const out: DebtAccount[] = [];
  filler.forEach((c, i) => {
    const f = FIN[i % FIN.length];
    const ver = i % 6 === 2 ? 2 : i % 17 === 4 ? 4 : 1;
    const history = Array.from({ length: ver - 1 }, (_, k) => rec(k + 1, c.code, f - (ver - k) , k === 0 ? null : 1, `202${5 + (k > 0 ? 1 : 0)}-0${k + 1}-01`, `2026-0${k + 3}-30`, WHO[(i + k) % 5], `2026-0${k + 1}-01T09:15:00Z`, k === 0 ? 'Khởi tạo' : `Nâng tuổi theo phụ lục 0${k}/2026`));
    const status = i % 11 === 5 ? 'CLOSED' : i % 13 === 7 ? 'SUPERSEDED' : 'ACTIVE';
    out.push(acc(c.code, c.code, 'GOLD', f, {
      version: ver, history, status, isActive: status === 'ACTIVE', uom: i % 10 === 3 ? 'GRAM' : 'LUONG', note: NOTES[i % NOTES.length],
      journalEntryCount: i % 3 === 0 ? i * 2 + 1 : 0, effectiveFrom: ver > 1 ? '2026-06-01' : '2026-01-01',
      modifiedBy: WHO[i % 5], modifiedAt: `2026-${String(5 + (i % 6)).padStart(2, '0')}-${String(1 + (i % 27)).padStart(2, '0')}T0${i % 9}:30:00Z`,
    }));
    if (i % 4 === 0) out.push(acc(`${c.code}_BAC`, c.code, 'SILVER', 92.5, { modifiedBy: WHO[(i + 1) % 5], modifiedAt: '2026-10-15T10:00:00Z', note: i % 8 === 0 ? 'Sổ bạc riêng' : '' }));
  });
  return out;
}

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
  { customerCode: '400001', goldLimit: 5, silverLimit: null, laborLimit: 50000000, termDays: 30, approvalNote: 'Hạn mức khách lẻ theo đợt', debt: { gold: 5.4, silver: 0, labor: 12000000 }, nextDueDate: '2026-12-05' },
  { customerCode: '400002', goldLimit: null, silverLimit: null, laborLimit: null, termDays: 0, approvalNote: 'Khách thanh toán ngay, không giới hạn', debt: { gold: 12, silver: 2, labor: 300000000 }, nextDueDate: null },
  { customerCode: '400003', goldLimit: 10, silverLimit: 10, laborLimit: 80000000, termDays: 7, approvalNote: '', debt: { gold: 4, silver: 2, labor: 10000000 }, nextDueDate: '2026-11-14' },
  { customerCode: '400004', goldLimit: 15, silverLimit: 5, laborLimit: 60000000, termDays: 30, approvalNote: 'Đã quá hạn thanh toán, cần theo dõi', debt: { gold: 3, silver: 0, labor: 5000000 }, nextDueDate: '2026-11-01' },
  { customerCode: '200009', goldLimit: 25, silverLimit: 15, laborLimit: 150000000, termDays: 30, approvalNote: '', debt: { gold: 10, silver: 3, labor: 40000000 }, nextDueDate: '2026-12-10' },
  { customerCode: '300001', goldLimit: 100, silverLimit: 50, laborLimit: 1000000000, termDays: 45, approvalNote: 'Hạn mức cao điểm Tết Nguyên Đán', debt: { gold: 85, silver: 40, labor: 800000000 }, nextDueDate: '2026-12-30' },
  { customerCode: '300046', goldLimit: 200, silverLimit: 100, laborLimit: 2000000000, termDays: 60, approvalNote: '', debt: { gold: 120, silver: 10, labor: 350000000 }, nextDueDate: '2027-01-10' },
  { customerCode: '300061', goldLimit: 500, silverLimit: 200, laborLimit: 5000000000, termDays: 30, approvalNote: 'Tập đoàn, phê duyệt BOD', debt: { gold: 510, silver: 100, labor: 2000000000 }, nextDueDate: '2026-12-01' },
  { customerCode: '200158', goldLimit: 30, silverLimit: 20, laborLimit: 100000000, termDays: 21, approvalNote: '', debt: { gold: 31, silver: 25, labor: 60000000 }, nextDueDate: '2026-11-30' },
  { customerCode: '200207', goldLimit: 8, silverLimit: null, laborLimit: 40000000, termDays: 15, approvalNote: '', debt: { gold: 1, silver: 0, labor: 120000000 }, nextDueDate: '2026-12-03' },
  { customerCode: '100013', goldLimit: 12, silverLimit: 6, laborLimit: 90000000, termDays: 30, approvalNote: '', debt: { gold: 11.5, silver: 1, labor: 50000000 }, nextDueDate: '2026-12-12' },
  { customerCode: '100000', goldLimit: 40, silverLimit: 20, laborLimit: 250000000, termDays: 30, approvalNote: 'Khởi tạo hạn mức tín dụng định kỳ năm 2026', debt: { gold: 8, silver: 2, labor: 20000000 }, nextDueDate: null },
  { customerCode: '200010', goldLimit: 10, silverLimit: 5, laborLimit: 50000000, termDays: 30, approvalNote: '', debt: { gold: 9.6, silver: 0, labor: 20000000 }, nextDueDate: '2026-11-16' },
  { customerCode: '200012', goldLimit: 15, silverLimit: 0, laborLimit: 0, termDays: 14, approvalNote: '', debt: { gold: 2, silver: 0, labor: 10000000 }, nextDueDate: '2026-12-09' },
  { customerCode: '200015', goldLimit: 6, silverLimit: 3, laborLimit: 30000000, termDays: 365, approvalNote: 'Kỳ hạn dài theo hợp đồng nguyên tắc', debt: { gold: 0, silver: 0, labor: 0 }, nextDueDate: null },
];

const rule = (n: number, code: string, customerCode: string, material: 'GOLD' | 'SILVER', kho: number, giao: number, extra: Partial<Rule> = {}): Rule => ({
  id: `r${n}`, debtAccountCode: code, customerCode, material, productionFineness: kho, deliveryFineness: giao,
  lossRate: Math.round((giao - kho) * 100) / 100, effectiveFrom: '2026-01-01', effectiveTo: null,
  approvalReason: null, approvedRole: null, isActive: true, note: '', updatedBy: CURRENT_USER, updatedAt: NOW, ...extra,
});

export const rules: Rule[] = [
  rule(1, '100003', '100003', 'GOLD', 61, 62),
  rule(2, '100003_01', '100003', 'GOLD', 61, 62.5),
  rule(3, '100013', '100013', 'GOLD', 61, 62, { effectiveFrom: '2025-01-01', effectiveTo: '2025-06-30' }),
  rule(4, '100013', '100013', 'GOLD', 71, 72, { effectiveFrom: '2025-07-01', effectiveTo: '2025-12-31' }),
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
  rule(15, '100000', '100000', 'GOLD', 61, 61, { effectiveFrom: '2025-01-01', effectiveTo: '2026-05-31' }),
  rule(16, '100000', '100000', 'GOLD', 61, 62, { effectiveFrom: '2026-06-01', note: 'Theo phụ lục 06/2026' }),
  rule(17, '100099', '100099', 'GOLD', 61, 61, { effectiveFrom: '2026-02-01' }),
  rule(18, '200009', '200009', 'GOLD', 62, 61.5, { effectiveFrom: '2026-10-01', approvalReason: 'Khách đề nghị hạ tuổi giao do chất lượng lô hàng tháng 10', approvedRole: 'KTT' }),
  rule(19, '300046', '300046', 'GOLD', 76, 74.5, { effectiveFrom: '2026-08-01', approvalReason: 'Phê duyệt ngoại lệ theo biên bản làm việc với Ban Giám Đốc ngày 30/07/2026', approvedRole: 'BOD' }),
  rule(20, '100099_BAC', '100099', 'SILVER', 92.5, 93.5, { effectiveFrom: '2025-06-01', effectiveTo: '2025-12-31' }),
  rule(21, '200158', '200158', 'GOLD', 67, 67, { effectiveFrom: '2025-01-01', effectiveTo: '2026-02-28' }),
  rule(22, '200158', '200158', 'GOLD', 69, 69.3, { effectiveFrom: '2026-03-01' }),
  rule(23, '400001', '400001', 'GOLD', 75, 75.5, { effectiveFrom: '2026-01-15' }),
  rule(24, '400002', '400002', 'GOLD', 99.99, 99.99, { effectiveFrom: '2026-03-01' }),
  rule(25, '400003', '400003', 'GOLD', 41.6, 42, { effectiveFrom: '2026-01-01', effectiveTo: '2026-08-31' }),
  rule(26, '400003', '400003', 'GOLD', 58.5, 59, { effectiveFrom: '2026-09-01', note: 'Chuyển sang vàng 14K' }),
  rule(27, '400005', '400005', 'GOLD', 68, 67.5, { effectiveFrom: '2026-11-01', approvalReason: 'Bù hao theo thỏa thuận riêng với chủ cửa hàng, có văn bản xác nhận', approvedRole: 'KTT' }),
  rule(28, '300001', '300001', 'GOLD', 75, 75.2, { effectiveFrom: '2026-01-01' }),
  rule(29, '300061', '300061', 'SILVER', 99.9, 99.9, { effectiveFrom: '2026-01-01' }),
];
