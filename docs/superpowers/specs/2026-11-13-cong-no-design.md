# Module Công nợ (CS8.E1) — Thiết kế

Ngày: 2026-11-13. Nguồn: Confluence PP, CS8.E1.US-01..04. Prototype BA: dungseva.surge.sh (#/debt-accounts, #/rules-settings).

## Nguyên tắc tối cao (người dùng chốt 2026-11-13)
Làm theo tài liệu BA 100%: mọi AC, BR, data dictionary, thông báo lỗi, nhãn, kích thước (kể cả 880px) và prototype BA đều là yêu cầu. Khi BA và Figma DS lệch nhau, BA thắng. Chỉ khi BA không nói thì mới dùng ERP/DS.

## Mục tiêu
Kế toán công nợ cấu hình master data công nợ khách hàng vàng/bạc trong 4 màn, đúng quy tắc BA. Chạy được, mock data, nhìn như ERP Sevago (`develop.admin.purchase.sevago.local/proposal-purchase`).

## Không làm (non-goals)
- Không API, không đăng nhập/phân quyền, không i18n, không lưu bền (F5 là reset mock).
- Không làm Sổ chi tiết KH (US-03 AC-04 chỉ link sang trang placeholder).
- Không workflow phê duyệt thật (US-04 BR-03): chỉ bắt buộc nhập lý do + hiển thị cấp duyệt cần có.
- Không dựng lại toàn bộ ERP; chỉ shell (sidebar + header) đủ chứa 4 màn.

## Anti-goal
Giống ERP mà sai quy tắc nghiệp vụ = hỏng. Quy tắc đúng quan trọng hơn pixel.

## Stack (quyết định của tui, chưa được bạn chốt)
Vite + React + TypeScript + MUI + react-router. Không thêm lib khác (không DataGrid, không form lib, không state lib): dùng `useState`/context + MUI Table, Drawer, Dialog.
## Component & token: bám ERP Mua hàng, không tự vẽ
ERP là MUI thuần (không có thư viện UI riêng), theme tùy biến. Module dựng lại đúng theme này rồi chỉ dùng component MUI như ERP. Số liệu đọc trực tiếp từ ERP đang chạy (đã kiểm):

**Theme:** Inter. Primary `#07554B` (light `#018775`, dark `#043731`), error `#BB0000`, success `#2E7D32`, info `#105089`, warning `#FFC107`. Nền `#FFF`, paper `#FAFAFA`, chữ `#0C0C0C` / phụ `#242424`, disabled `#A7A7A7`, divider `#B3B3B3`. Spacing 8px, radius mặc định 4px (nút, chip, trang số dùng 6px; ô tìm kiếm 10px).
**Chữ:** body1 14/400, body2 14/500, subtitle1 14/550, subtitle2 15/550, h6 18/550, caption 12/300, button 14/550 (theme đặt uppercase nhưng ERP hiển thị chữ thường, tui sẽ kiểm lại khi dựng).

| Phần | Component MUI | Spec đo được |
|---|---|---|
| Sidebar | nền `#07554B`, rộng ~173–211px, chữ trắng 14px, nhóm có caret, divider trắng 18% | mục 36px cao |
| Tab trạng thái | `Tabs`/`Tab` | cao 34px, chữ 14px, chọn = đậm 600, vạch dưới 2px |
| Tìm kiếm | `OutlinedInput` + icon đầu | cao 32px, radius 10px, rộng ~310px |
| Nút chính `+ Tạo` | `Button contained` | cao 32px, `6px 16px`, radius 6px, bóng nhẹ, nền primary |
| Bảng | `TableContainer`/`Table` sticky header | th `#F9FAFB` viền `#E4E6E6` chữ 550, hàng cao 54px, `TableRow hover`, ô padding 8px |
| Chip trạng thái | `Typography caption` có viền, KHÔNG phải `Chip` | 12/500, padding `4px 6px`, radius 6px; vàng `#CA8A03` nền `#F4E8CD`, xanh lá `#069021`/`#CDE9D3`, đỏ `#EF1515`/`#FCD0D0`, xanh dương `#1570EF`/`#D0E2FC` |
| Icon thao tác | `material-icons` (`Icon`), nhóm trong `Stack`, mờ khi disabled | |
| Phân trang | `Pagination outlined rounded` + `Select` số dòng | nút 32px, radius 6px |
| Form | `TextField`/`Autocomplete`/`Select`, nhãn trên ô, dấu `*` đỏ, thẻ "Thông tin chung" có tiêu đề xanh primary + chevron thu gọn | ô cao 32px; footer cố định đáy: Hủy / Lưu nháp / Xác nhận (nút chính xanh) |
| Trống | hình hộp rỗng (empty state) giữa bảng | |
| Breadcrumb | chữ xám, mục cuối đậm | |

## Đối chiếu Figma Seva DS (đọc qua Chrome, chỉ xem trực quan)
Figma MCP chưa bật Dev Mode nên chưa có số đo chính xác từ Figma; đã xem được các trang sau và dùng để chọn component. Số đo lấy từ ERP ở bảng trên, Figma dùng để quyết định dùng component nào.
- **Popup** (trang Popup): kích thước chuẩn **420 / 600 / 800 / 840 / 960px**. Có Header popup (Title + nút đóng) và Footer popup căn phải với 1–3 nút: phụ (viền xám), outlined primary, contained primary. **BA ghi popup lịch sử 880px, không có trong DS**: ĐÃ CHỐT (người dùng): bám BA 100%, dùng 880px.
- **Drawer:** DS không có trang Drawer riêng. BA yêu cầu "Drawer" cho US-01/US-03. Tui dùng `Drawer` MUI phải-sang, đầu = Header popup, chân = Footer popup, theme ERP.
- **Badges:** 3 kiểu (viền / đặc / nền nhạt) × 10 màu × 3 cỡ. Chip trạng thái ERP list là kiểu viền + nền nhạt. Tui dùng đúng kiểu này cho mọi badge (version, trạng thái, hạn mức). Màu 5 badge hạn mức US-03: An toàn xanh lá, Cảnh báo vàng/cam, Vượt HM Vàng đỏ, Vượt HM Bạc tím/chàm, Vượt HM Công cam.
- **Information:** DS có bố cục "Specifications" dọc và ngang (nhãn + giá trị, kèm user, ngày, select, textarea): dùng cho phần chi tiết trong accordion lịch sử version.
- **Trang DS còn lại có dùng:** Button, Text field, Dropdown/Selectable item, Date picker, Toggle, Tab, Pagnigation, Alert (banner khóa bất biến / cảnh báo chặn), Breadcrumb, Table (*), Side bar, Header.
- Cần xem lại khi dựng từng màn nếu số đo trong ERP và Figma lệch nhau: ERP đang chạy là nguồn thắng, vì đó là cái người dùng thấy.

## Shell
Sidebar nhóm "Công nợ" gồm 4 mục. Mỗi trang list theo mẫu ERP: tab trạng thái có đếm, ô tìm kiếm, nút `+ Tạo`, bảng, chip trạng thái, phân trang.

## 4 màn

### 1. Sổ đối chiếu (US-01) — `/debt-accounts`
- Cột: mã đối chiếu, KH, loại NL, tuổi, version (badge vN), trạng thái, số bút toán, thao tác.
- Drawer "Thêm Mã Đối Chiếu": KH, loại NL (Vàng/Bạc/Bạch kim), tuổi (mặc định 61), ghi chú. Mã tự điền = mã KH (+ `_BAC` nếu bạc). Lưu → version 1, ACTIVE, ghi audit log CREATED.
- Chặn tạo khi (KH, loại NL) đã có mã active; nút Lưu disabled + cảnh báo trỏ sang "Đổi tuổi".
- Toggle Hoạt động/Tạm khóa. Kích hoạt một mã thì mã khác cùng (KH, loại NL) thành Ngưng hoạt động.
- Xóa: nếu số bút toán > 0, modal chặn, chỉ cho "Chuyển sang Ngưng hoạt động" hoặc Đóng. Nếu = 0 thì cho xóa cứng.
- Bấm badge version mở popup lịch sử (màn 2).

### 2. Đổi tuổi đối chiếu & lịch sử version (US-02) — popup từ màn 1
- Popup đổi tuổi: tuổi mới, ngày hiệu lực, lý do.
- Validate: 0 < tuổi ≤ 100; khác tuổi hiện tại; lý do ≥ 6 ký tự. Nút xác nhận disabled khi sai.
- Xác nhận: tạo version N+1 ACTIVE, version cũ SUPERSEDED với `effective_to` = ngày hiệu lực − 1.
- Quy đổi số dư giữ vàng 24K: `dư mới = dư cũ × tuổi cũ / tuổi mới` (vàng đã giao, hàng chưa giao). Tiền công giữ nguyên. Hiển thị Δ24K = 0.
- Popup lịch sử (880px, accordion): VERSION, mã, tuổi + delta, hiệu lực, người tạo, trạng thái; mở rộng xem lý do và banner vàng "Khóa bất biến".

### 3. Hạn mức tín dụng (US-03) — `/credit-limits`
- Hạn mức theo khách hàng, 3 trục độc lập: Vàng, Bạc (lượng, chuẩn 99.99%), Tiền công (VNĐ). 0/trống = không giới hạn. Kỳ hạn nợ 0–365 ngày (mặc định 30).
- Badge trạng thái, tính từ dư nợ mock + ngày đến hạn: An toàn, Cảnh báo (còn ≤ 3 ngày), Vượt HM Vàng, Vượt HM Bạc, Vượt HM Công. Thứ tự ưu tiên khi nhiều điều kiện: tui tự chọn Vượt HM (Vàng > Bạc > Công) trên Cảnh báo trên An toàn.
- Drawer tạo/sửa. Khi sửa: ô KH khóa, tiêu đề có tên KH, hiện dư nợ hiện tại.
- Bấm mã/tên KH hoặc nút Xem chi tiết: sang `/customer-ledger/:code` (placeholder).

### 4. Quy ước tuổi giao & hao lai (US-04) — `/rules-settings`
- Cột: mã đối chiếu, loại NL (Vàng/Bạc), tuổi kho, tuổi giao, hao lai %, hiệu lực từ–đến, trạng thái.
- Modal thêm/sửa. Hao lai = tuổi giao − tuổi kho, tự tính; dương hổ phách, âm đỏ.
- Validate: cả hai tuổi trong (0, 100].
- Quy ước mới có hiệu lực từ D thì quy ước cũ cùng mã đối chiếu và cùng tuổi kho tự chốt D−1; không cho chồng thời gian.
- Hao lai âm: bắt buộc lý do ≥ 20 ký tự; hiển thị cấp duyệt cần (|ΔF| ≤ 1% Kế toán trưởng, > 1% BOD/CFO). Chỉ hiển thị, không có luồng duyệt.

## Prototype BA (dungseva.surge.sh) — đã xem, dùng làm bố cục
Routes: `/debt-accounts`, `/credit-limits`, `/rules-settings`. Sidebar nhóm "SỔ CÔNG NỢ" (Mã Đối Chiếu) và "CẤU HÌNH & CHÍNH SÁCH" (Hạn Mức & Cảnh Báo Rủi Ro, Quy Ước Tuổi & Hao Lai). Giữ đúng tên mục này.

- **Sổ đối chiếu:** tiêu đề "Quản Lý Mã Đối Chiếu & Sổ Công Nợ", breadcrumb "Quản lý công nợ / Danh mục sổ đối chiếu". 4 thẻ KPI (Tổng mã đối chiếu; Sổ Vàng; Sổ Bạc; Đang hoạt động "x / y" + tỷ lệ). Ô tìm kiếm + dropdown trạng thái (Tất cả / Đang hoạt động (Active) / Version cũ (Đã nâng version) / Tạm khóa / Ngưng HĐ) + chip Loại NL có đếm (TẤT CẢ / VÀNG (GOLD) / BẠC (SILVER)) + dòng quy tắc "1 Khách hàng - 1 Loại nguyên liệu chỉ có duy nhất 1 mã đối chiếu (Đổi tuổi ➔ Nâng Version)". Cột: STT, MÃ ĐỐI CHIẾU (nút copy + badge vN), TÊN KHÁCH HÀNG (+ dòng phụ "Phiên bản vN • Đang hoạt động" khi N>1, bấm mở lịch sử), MÃ — TÊN CÔNG TY, KÊNH PHÂN PHỐI, LOẠI NL, ĐVT, TUỔI ĐỐI CHIẾU, BÚT TOÁN SỔ CÁI ("N bút toán"), TRẠNG THÁI ("Hoạt động (vN)"), THAO TÁC (Lịch sử, Sửa/Đổi tuổi, Toggle, ⋯). Phân trang: số dòng 25/50/100/130/200/Tất cả, "Trang x / y". Drawer "Thêm Mã Đối Chiếu" có 2 thẻ "ĐỐI TƯỢNG CRM & NGUYÊN LIỆU" và "ĐỊNH DANH MÃ ĐỐI CHIẾU", chip "Gợi ý mã nhanh" (`100006`, `100006_R`, `100006_BAC`, `100006_100`).
- **Popup lịch sử:** tiêu đề "Lịch Sử Phiên Bản Mã Đối Chiếu: {mã}", dải thông tin KH/Kênh/Phiên bản hiện tại/Tổng số phiên bản, accordion, chân "Toàn vẹn số dư: Bút toán lịch sử bảo toàn bất biến theo tuổi từng version" + nút "Đổi Tuổi Đối Chiếu (Tạo Version Mới)". Nút Thu gọn.
- **Popup đổi tuổi:** tiêu đề "Đổi Tuổi Đối Chiếu: {mã}" + "v2 → v3", mục "1. THÔNG TIN PHIÊN BẢN & HIỆU LỰC" (phiên bản hiện tại 'Sẽ khóa sổ' → phiên bản mới ô nhập % + badge chênh lệch + Ngày bắt đầu hiệu lực), bảng "Bảng Đối Chiếu Quy Đổi Số Dư Nợ [W_mới = W_cũ × (F_cũ / F_mới)]" với 3 dòng (Dư nợ Vàng đã giao; Hàng chưa giao (Chờ xuất); Tiền công (VNĐ)) + badge "Δ Vàng 24K = 0.0000 (Bảo toàn)", ô "Lý do thay đổi *", nút "Hủy Bỏ" / "Xác Nhận Đổi Tuổi (vN+1)".
- **Hạn mức:** tiêu đề "Quản Lý Hạn Mức Tín Dụng 3 Trục & Thời Hạn Thanh Toán", breadcrumb "Quản lý công nợ / Hạn Mức Tín Dụng & Kỳ Hạn Nợ". 4 thẻ KPI, ô tìm kiếm + dropdown "Trạng thái". Cột: MÃ KHÁCH, TÊN KHÁCH HÀNG / TIỆM VÀNG, HẠN MỨC VÀNG (LƯỢNG) / BẠC (LƯỢNG) / TIỀN (VNĐ) (mỗi ô: hạn mức + dòng "Nợ: x (y%)" + thanh tiến độ), KỲ HẠN NỢ ("Net 30 ngày"), TRẠNG THÁI NỢ, THAO TÁC (Chỉnh Sửa, Xem Chi Tiết). Nút "+ Tạo Mới Hạn Mức". Drawer có thẻ số dư hiện tại (Dư nợ vàng hiện tại, Dư nợ tiền công hiện tại, tuổi quy ước đối chiếu) và nút "Lưu Cấu Hình Hạn Mức".
- **Quy ước:** tiêu đề "Thiết Lập Quy Ước Tuổi Giao & Hao Lai", breadcrumb "Quản lý công nợ / Cấu hình & Chính sách / Bảng Quy Ước Tuổi Giao Hàng & Hao Lai". Banner vàng giải thích công thức. 3 thẻ KPI (Tổng số quy ước, Quy ước Vàng, Quy ước Bạc). Lọc: tìm kiếm, Nguyên liệu, Trạng thái. Cột: STT, MÃ ĐỐI CHIẾU, TÊN KHÁCH HÀNG, MÃ — TÊN CÔNG TY, LOẠI NL, TUỔI KHO (F_STOCK), TUỔI GIAO (F_DELIVERY), HAO LAI (%) (chip + dòng "62% - 61%"), NGÀY HIỆU LỰC, TRẠNG THÁI ("HIỆU LỰC"), THAO TÁC (sửa, lịch sử, xóa). Nút "+ Thêm Quy Ước Mới". Modal "Thêm Mới Quy Ước Tuổi Giao & Hao Lai Theo Sổ": Số Đối Chiếu Công Nợ, Khách Hàng CRM (chỉ đọc), Loại Nguyên Liệu (chỉ đọc), Ngày Bắt Đầu Hiệu Lực, Ngày Kết Thúc (Tùy chọn), Tuổi Kho Thực Tế (F_stock), Tuổi Giao Ghi Nợ (F_delivery), dòng "Hao lai = Tuổi giao (62%) - Tuổi kho (61%) = +1.00%", Lý Do Điều Chỉnh / Căn Cứ Hợp Đồng, Ghi Chú Bổ Sung, "Vai trò kiểm duyệt" (Kế toán trưởng / BOD), nút "Hủy Bỏ" / "Tạo Quy Ước".

**Các chỗ BA (chữ trong Confluence) lệch prototype. Tui chọn chữ Confluence, đúng yêu cầu "bám tài liệu":**
| Chỗ | Prototype | Confluence (dùng) |
|---|---|---|
| Dải tuổi hợp lệ | "50% — 100%", "Sàn 40% – Trần 99.99%" | 0 < tuổi ≤ 100.00, lỗi "Tuổi đối chiếu phải lớn hơn 0% và không vượt quá 100.00%" (US-04: "Tuổi kim loại phải…") |
| Nút lưu drawer US-01 | "Tạo Mã Đối Chiếu" | "Lưu & Áp Dụng"; nút form US-04 "Tạo Quy Ước" / "Lưu Cập Nhật" |
| HM Vàng, HM Tiền công | "Bắt buộc > 0" | không bắt buộc; 0/trống = không giới hạn |
| Kỳ hạn nợ | "1 - 365 ngày" | 0–365, 0 = thanh toán ngay |
| Badge hạn mức | theo % dùng (<80%, ≥80%, ≥100%), có "VIP Vô hạn" | 5 badge: An Toàn, Cảnh Báo (≤3 ngày tới hạn), Vượt HM Vàng, Vượt HM Bạc, Vượt HM Công. Bỏ "VIP Vô hạn" |
| Số dư mock 100003 | tiền công 86.505.000 | BA US-02: vàng đã giao 15.3670, chưa giao 2.3500, tiền công 89.500.000 |
| Xóa mã (US-01 BR-03) | | BR-03 tự mâu thuẫn ("có bút toán: cho xóa cứng" lặp 2 lần). Theo AC-06, BR-05 và data dictionary: có bút toán thì CẤM xóa |
| Nút ngoài AC | Import Hạn Mức, Xuất Excel, In Danh Sách, Khôi phục mặc định, Tải file mẫu, Nhập Excel | không có AC. Không làm (nút không có thì không thể sai), liệt kê lại cho BA |

Chưa có AC nên tui tự đặt, đánh dấu "(tự đặt)" trong plan: thông báo khi tuổi mới = tuổi hiện tại; chặn ngày hiệu lực lùi về trước version hiện tại; mã đối chiếu trùng.

## Dữ liệu mock
Vài KH thật theo BA: 100003 HÒA HIẾU (v2, 62%, dư vàng 15.3670, chưa giao 2.3500, tiền công 89.500.000), 100006 TƯ MINH DIAMOND (61%, 6 bút toán), 200055 KIM NGỌC. Đủ để thấy cả 5 badge hạn mức.

## Kiểm thử
Logic thuần (quy đổi 24K, hao lai, chồng thời gian, trạng thái hạn mức, chặn trùng) tách thành hàm nhỏ trong một file và có test bằng vitest. UI không viết test; kiểm bằng cách chạy và xem trong Chrome.

## Việc để builder tự quyết
Cấu trúc thư mục, tên component, chi tiết bố cục trong drawer/modal, nội dung mock ngoài các KH nêu trên.
