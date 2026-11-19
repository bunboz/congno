# Câu hỏi và điểm cần BA xác nhận (CS8.E1.US-01 đến US-04)

Nguồn: 4 trang Confluence, đối chiếu với giao diện đang làm. Phân quyền do dev, không nằm trong danh sách này.

## A. Tài liệu tự mâu thuẫn hoặc thiếu

1. **US-01 BR-03** ghi hai dòng trái nhau: mã đã có bút toán "cho phép xóa cứng" và "cấm xóa tuyệt đối". AC-06 ghi cấm. Đề nghị sửa BR-03.
2. **Tạm khóa và Ngưng hoạt động**: AC-06 (popup chặn xóa) ghi nút "Chuyển sang Ngưng hoạt động", nhưng theo từ điển đây là hành động của người dùng, tương ứng "Tạm khóa" (CLOSED). "Ngưng hoạt động" (SUPERSEDED) chỉ dành cho bản bị thay thế. Nút nên gọi tên nào? Người dùng có cần phân biệt hai trạng thái không?
3. **Câu cảnh báo chặn trùng mã**: US-01 AC-02 và US-02 AC-06 khác nhau vài chữ ("vui lòng sử dụng" / "hãy sử dụng", có hoặc không câu "Theo quy tắc..."). Dùng bản nào?
4. **Quá hạn nợ**: từ điển có trạng thái `OVERDUE` riêng, nhưng US-03 AC-02 chỉ có 5 badge (không có "Quá hạn"). Khách quá hạn hiển thị badge nào?
5. **Thứ tự ưu tiên badge** khi một khách vừa vượt hạn mức Vàng vừa vượt Bạc: hiển thị một badge hay nhiều?
6. **Quy tắc thiếu**: thông báo khi mã đối chiếu trùng (từ điển ghi Unique nhưng không có câu; hiện chỉ làm mờ nút Lưu, không hiện câu); hậu tố mã cho **Bạch kim** (BA chỉ có `_BAC` cho Bạc, hiện để mã trùng mã khách hàng nên trùng mã Vàng của cùng khách và nút Lưu bị mờ); làm tròn khi quy đổi tuổi (đang làm tròn 4 chữ số thập phân); ngày hiệu lực của phiên bản mới có bắt buộc sau ngày hiệu lực hiện tại không.

## B. Luồng chưa có màn hình

7. **Duyệt hao lai ngược** (US-04 BR-03): cần Kế toán trưởng (≤1%) hoặc BOD/CFO (>1%) phê duyệt, từ điển có `approved_by`, nhưng BA không nói màn nào để duyệt, trạng thái chờ duyệt là gì, và quy ước có hiệu lực trước hay sau khi duyệt.
8. **Sổ chi tiết khách hàng** (US-03 AC-04): bấm mã/tên khách hoặc "Xem Chi Tiết" sang `CustomerLedgerView`, nhưng màn này không thuộc 4 US. Màn đích là gì, hay tạm thời để trống?

## C. Chữ hiển thị BA chưa ghi (đề nghị BA cung cấp câu chuẩn)

9. Thông báo lỗi nhập: "tuổi mới phải khác tuổi hiện tại" (BR-05), "lý do tối thiểu 6 ký tự" (BR-04), "lý do duyệt ngoại lệ tối thiểu 20 ký tự" (BR-03), "hạn mức phải ≥ 0", "số ngày nợ 0 đến 365", "quy ước chồng thời gian hiệu lực" (BR-02).
10. Toast thành công cho: tạo mã, nâng version, lưu hạn mức, lưu quy ước, đổi trạng thái, xóa.
11. Câu xác nhận khi khóa/mở mã (AC-04 không ghi hộp xác nhận) và khi xóa mã/quy ước chưa có bút toán.
12. Chữ trạng thái quy ước: từ điển ghi "Đang áp dụng / Hết hiệu lực / Đóng".

## D. Thành phần giao diện BA không nhắc

13. **Cột bảng**: BA không liệt kê cột của 3 bảng. Hiện lấy từ từ điển dữ liệu. Ô khách hàng đang gộp (mã - tên, dòng phụ tên công ty), trong khi US-03 AC-04 ghi "Mã Khách" và "Tên Khách Hàng" là hai chỗ bấm riêng.
14. **Tab trạng thái, ô tìm kiếm, bộ lọc cột, phân trang, thứ tự dòng** (BA không ghi, đang theo mẫu ERP).
15. **Dòng phụ "Phiên bản v2 • Đang hoạt động"** (US-01 AC-03) và **nút [Lịch sử]** (US-02 AC-05): hai lối vào cùng mở một popup. Đề xuất chỉ giữ một. Dòng phụ trùng với huy hiệu `v2` và cột trạng thái, và dễ vỡ khi tên khách dài.
16. **Toggle ở cột trạng thái**: US-01 AC-04 ghi toggle nằm ở cột Thao tác. Đang đặt toggle ngay trong cột "Trạng Thái Hoạt Động" (theo Figma DS, ERP chưa có trang nào dùng toggle trong bảng).
17. **Hạn mức**: mô tả "tạo mới" và "chỉnh sửa" đều là Drawer; hiển thị ô vượt hạn mức (đang tô nền đỏ nhạt và chip "Vượt HM" đặc) chưa có yêu cầu trực quan từ BA.
18. **Tên menu và breadcrumb** (BA không ghi).

## E. Đã làm theo "chỉ đúng chữ BA" và đang để trống chờ BA

19. **Thông báo lỗi nhập** (tuổi mới khác tuổi hiện tại, lý do tối thiểu 6/20 ký tự, ngày hiệu lực, hạn mức ≥ 0, số ngày nợ 0 đến 365, quy ước chồng thời gian): chỉ hiện ô viền đỏ và nút Lưu mờ, **không có câu chữ** vì BA chưa ghi.
20. **Toast**: BA chỉ ghi "hiển thị Toast thông báo thành công", đang dùng đúng một chữ "Thành công" cho mọi thao tác.
21. **Xóa quy ước tuổi giao và hao lai**: BA US-04 không có chức năng xóa nên đã **bỏ nút Xóa** ở bảng Quy ước (chỉ còn Sửa).
22. **Hộp xác nhận khi khóa/kích hoạt mã và khi xóa mã chưa có bút toán**: BA không ghi, đang giữ để tránh thao tác nhầm, chữ trong hộp là chữ tạm. Cần BA quyết có hộp xác nhận không và câu chữ.

## F. BA đã trả lời (chat với Nguyễn Đăng Khoa, ngày 19/11/2026)

23. **Mã Ngưng hoạt động có bật lại được không?** Trả lời: **có**, "hoặc version cũ á, cho phép kích hoạt lại". Đã khớp với app đối với mã Ngưng hoạt động. **Còn mở:** kích hoạt lại **version cũ** hoạt động thế nào (phiên bản hiện tại có bị ngưng không; số dư và tuổi có quy đổi lại không; có sinh version mới không) và nút nằm ở đâu (popup Lịch sử phiên bản?). Đề nghị BA bổ sung vào Confluence vì câu trả lời mới chỉ qua chat.
