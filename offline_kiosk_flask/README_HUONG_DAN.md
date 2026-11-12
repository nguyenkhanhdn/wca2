# HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG HỆ THỐNG KIOSK DỊCH VỤ CÔNG MỘT CỬA PHƯỜNG SƠN TRÀ
## Phiên bản Offline Standalone cho Windows (Python Flask + Tailwind + SQLite)

Hệ thống được thiết kế đặc thù để **chạy hoàn toàn ngoại tuyến (100% Offline)** trên các máy tính Kiosk cảm ứng tại Bộ phận Tiếp nhận & Trả kết quả của UBND Phường Sơn Trà, không phụ thuộc vào kết nối Internet hay máy chủ đám mây.

---

### I. CÁC TÍNH NĂNG ĐẶC BIỆT CỦA PHIÊN BẢN OFFLINE
1. **Cơ sở dữ liệu SQLite cục bộ (`dvc_sontra.db`)**:
   - Lưu trữ toàn bộ 14 thủ tục hành chính, 8 ô bàn tiếp nhận và danh sách chuyên viên phụ trách.
   - Hỗ trợ thêm/sửa/xóa và khôi phục dữ liệu gốc ngay tại bảng quản trị `http://localhost:5000/admin`.
2. **Giao diện chuẩn Kiosk cảm ứng & Trợ năng người cao tuổi**:
   - Tùy chỉnh cỡ chữ 3 cấp độ (A, A+, A++) để người lớn tuổi nhìn rõ.
   - Chế độ màu tương phản cao (High Contrast).
   - In phiếu hướng dẫn thành phần hồ sơ mang về với 1 chạm.
3. **Trợ lý Người máy Ây AI phát âm tiếng Việt chuẩn**:
   - Tự động chuẩn hóa phát âm:
     - `AI` đọc là **"Ây ai"** (không đọc lặp thành "Ây Ây ai").
     - `Đ/c` đọc là **"đồng chí"**.
     - `BHYT` đọc là **"bảo hiểm i tế"** (không đọc âm "y dài").
     - `VNeID` đọc là **"Vi En Ai đi"**.
     - Dấu gạch chéo lựa chọn (ví dụ: `Bệnh viện / Trạm y tế`) tự động đọc là **"Bệnh viện hoặc Trạm y tế"**.
   - Cơ chế ngắt câu và giữ nhịp đọc âm thanh (Audio Keep-alive) chống gián đoạn giữa chừng.
   - Đồng hồ đếm ngược tự động tạm dừng khi Người máy đang nói, chỉ đếm ngược khi kết thúc lời hướng dẫn.
4. **Khởi chạy Kiosk toàn màn hình cảm ứng (Kiosk Mode)**:
   - Tự động kích hoạt Microsoft Edge hoặc Google Chrome ở chế độ toàn màn hình (`--kiosk`).

---

### II. YÊU CẦU HỆ THỐNG TRÊN MÁY TÍNH WINDOWS
- Hệ điều hành: Windows 10, Windows 11 hoặc Windows Server (64-bit hoặc 32-bit).
- Python: Phiên bản 3.9 trở lên (đã có sẵn `pip`).
  - *Lưu ý khi cài Python*: Tích chọn ô **"Add Python to PATH"**.
- Trình duyệt: Microsoft Edge (đã tích hợp sẵn trên Windows) hoặc Google Chrome.

---

### III. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (2 BƯỚC ĐƠN GIẢN)

#### Bước 1: Cài đặt môi trường (Chỉ làm 1 lần duy nhất)
- Giải nén thư mục `offline_kiosk_flask` vào ổ cứng máy Kiosk (ví dụ `C:\Kiosk_SonTra`).
- Nhấp đúp chuột vào file:
  ```
  CAI_DAT_WINDOWS.bat
  ```
- File này sẽ tự động tạo môi trường ảo `venv` và cài đặt các thư viện cần thiết (`Flask`, `Werkzeug`, `Jinja2`).

#### Bước 2: Khởi chạy sử dụng hàng ngày
- Mỗi sáng khi mở máy Kiosk, chỉ cần nhấp đúp vào file:
  ```
  CHAY_KIOSK_OFFLINE.bat
  ```
- Hệ thống sẽ tự động bật máy chủ cục bộ và mở ngay màn hình cảm ứng toàn màn hình tại địa chỉ:
  `http://localhost:5000`

---

### IV. CẤU TRÚC THƯ MỤC
```
offline_kiosk_flask/
├── CAI_DAT_WINDOWS.bat      # Script cài đặt 1-click
├── CHAY_KIOSK_OFFLINE.bat   # Script khởi chạy Kiosk toàn màn hình
├── DUNG_KIOSK.bat           # Script tắt máy chủ Kiosk
├── README_HUONG_DAN.md      # Tài liệu hướng dẫn sử dụng
├── requirements.txt         # Thư viện Flask, Jinja2, Werkzeug
├── app.py                   # Máy chủ Flask trung tâm (Port 5000)
├── database.py              # Xử lý SQLite3 và hạt giống dữ liệu ban đầu
├── ai_assistant.py          # Bộ phân tích ngữ nghĩa câu hỏi công dân
├── dvc_sontra.db            # Cơ sở dữ liệu SQLite độc lập
├── data/
│   └── initial_data.json    # File dữ liệu chuẩn 14 thủ tục & 8 ô bàn
├── templates/               # Giao diện HTML Jinja2
│   ├── base.html            # Khung sườn, thanh tiêu đề, Trợ lý AI
│   ├── standby.html         # Màn hình chờ Kiosk
│   ├── citizen.html         # Tra cứu thủ tục công dân
│   ├── service_detail.html  # Chi tiết hồ sơ, lệ phí, in ấn
│   ├── mindmap.html         # Sơ đồ 8 ô tiếp nhận
│   └── admin.html           # Bảng quản trị & sao lưu
└── static/                  # Tài nguyên tĩnh nội bộ (không cần internet)
    ├── css/
    │   └── tailwind.offline.css  # CSS đã biên dịch sẵn
    ├── js/
    │   ├── speech.js        # Động cơ phát âm chuẩn tiếng Việt
    │   └── kiosk.js         # Xử lý tương tác Kiosk & đếm ngược
    └── assets/              # Biểu trưng, hình ảnh sơ đồ
```

---

### V. ĐỊA CHỈ TRUY CẬP HỆ THỐNG
- Màn hình chờ Kiosk: `http://localhost:5000/`
- Tra cứu thủ tục công dân: `http://localhost:5000/citizen`
- Sơ đồ 8 ô tiếp nhận: `http://localhost:5000/mindmap`
- Trang quản trị của cán bộ: `http://localhost:5000/admin`
- Sao lưu dữ liệu JSON: `http://localhost:5000/api/backup`
