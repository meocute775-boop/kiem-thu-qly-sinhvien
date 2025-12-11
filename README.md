# 🎓 Hệ thống Quản lý Sinh viên

Một ứng dụng web hoàn chỉnh để quản lý thông tin sinh viên với giao diện thân thiện, validation thông minh và trải nghiệm người dùng tối ưu.

## 📋 Mục lục

-   [Giới thiệu](#-giới-thiệu)
-   [Tính năng nổi bật](#-tính-năng-nổi-bật)
-   [Cấu trúc dự án](#-cấu-trúc-dự-án)
-   [Cài đặt và Chạy](#-cài-đặt-và-chạy)
-   [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
-   [Thông tin đăng nhập](#-thông-tin-đăng-nhập)
-   [Dữ liệu và Validation](#-dữ-liệu-và-validation)
-   [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
-   [Tính năng bảo mật](#-tính-năng-bảo-mật)
-   [FAQ và Troubleshooting](#-faq-và-troubleshooting)

## 🎯 Giới thiệu

Hệ thống Quản lý Sinh viên là một ứng dụng web hiện đại được phát triển để giúp các trường học, khoa quản lý thông tin sinh viên một cách hiệu quả và an toàn. Ứng dụng tập trung vào trải nghiệm người dùng với validation thời gian thực, bảo vệ dữ liệu và giao diện trực quan.

## ✨ Tính năng nổi bật

### 🔐 Hệ thống bảo mật

-   **Đăng nhập có phân quyền** - Chỉ admin được truy cập
-   **Session persistence** - Duy trì đăng nhập khi refresh trang
-   **Bảo vệ dữ liệu** - Xác nhận trước khi mất dữ liệu

### 👥 Quản lý sinh viên thông minh

-   **Thêm sinh viên** - Form với validation real-time
-   **Sửa thông tin** - Chỉnh sửa an toàn với kiểm tra trùng lặp
-   **Xóa sinh viên** - Xóa với xác nhận an toàn
-   **Xem danh sách** - Bảng responsive với phân trang

### 🔍 Tìm kiếm và Lọc nâng cao

-   **Tìm kiếm thông minh** - Tìm theo nhiều trường cùng lúc
-   **Lọc theo khoa** - Lọc nhanh theo từng khoa
-   **Sắp xếp theo tên** - Sắp xếp theo tên cuối (họ Việt Nam)
-   **Real-time search** - Kết quả hiển thị ngay khi gõ

### 📊 Xuất dữ liệu và Báo cáo

-   **Xuất Excel/CSV** - File có encoding UTF-8
-   **Phân trang thông minh** - 10 sinh viên/trang với điều hướng
-   **Làm mới dữ liệu** - Reset tất cả bộ lọc

### ⚡ Validation và UX

-   **Validation real-time** - Kiểm tra ngay khi nhập
-   **Thông báo lỗi inline** - Hiển thị lỗi ngay dưới input
-   **Kiểm tra trùng lặp** - Mã SV, email, số điện thoại
-   **Modal thông minh** - Chỉ đóng khi xác nhận

## 📁 Cấu trúc dự án

```
kiem_thu_qly_sinhvien/
│
├── index.html                 # File chính khởi động ứng dụng
├── login.js                   # Xử lý đăng nhập và phân quyền
├── README.md                  # Tài liệu hướng dẫn (file này)
│
└── views/
    ├── adminView.js          # Giao diện và logic quản lý sinh viên
    └── back_end/
        └── qly_sinhvien.js   # Class StudentManager và API backend
```

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

-   Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
-   Máy chủ web (XAMPP, WAMP, hoặc Live Server) - khuyến nghị

### Cách chạy

#### 🔥 Phương pháp 1: XAMPP (Khuyến nghị)

1. Khởi động XAMPP
2. Copy thư mục dự án vào `htdocs`
3. Truy cập: `http://localhost/kiem_thu_qly_sinhvien`

#### ⚡ Phương pháp 2: Live Server (VS Code)

1. Mở thư mục dự án trong VS Code
2. Cài đặt extension "Live Server"
3. Right-click `index.html` → "Open with Live Server"

#### 📱 Phương pháp 3: Chạy trực tiếp

1. Double-click file `index.html`
2. Mở bằng trình duyệt web

## 📖 Hướng dẫn sử dụng

### Bước 1: Đăng nhập hệ thống

1. Mở ứng dụng
2. **Chọn vai trò:** Admin
3. **Nhập thông tin:** Email và mật khẩu
4. Click **"Đăng nhập"**

### Bước 2: Quản lý sinh viên

#### ➕ Thêm sinh viên mới

1. Click nút **"Thêm sinh viên"**
2. Điền đầy đủ thông tin (có validation real-time)
3. Click **"Lưu"** hoặc **ESC** để hủy

#### ✏️ Sửa thông tin sinh viên

1. Click nút **"Sửa"** ở hàng sinh viên
2. Thay đổi thông tin cần thiết
3. Click **"Lưu"** để xác nhận

#### 🗑️ Xóa sinh viên

1. Click nút **"Xóa"** ở hàng sinh viên
2. Xác nhận trong dialog popup

#### 🔍 Tìm kiếm và Lọc

-   **Tìm kiếm:** Nhập từ khóa vào ô search (real-time)
-   **Lọc khoa:** Chọn khoa trong dropdown
-   **Sắp xếp:** Chọn tiêu chí sắp xếp

#### 📊 Xuất dữ liệu

1. Click nút **"Xuất Excel"**
2. File CSV sẽ được tải về tự động

## 🔑 Thông tin đăng nhập

| Vai trò   | Email                 | Mật khẩu | Quyền truy cập                  |
| --------- | --------------------- | -------- | ------------------------------- |
| **Admin** | `phuonganh@gmail.com` | `123456` | ✅ Toàn quyền quản lý sinh viên |
| **User**  | `user@gmail.com`      | `123456` | ❌ Không có quyền truy cập      |

> **Lưu ý:** Chỉ tài khoản Admin mới có thể truy cập vào trang quản lý sinh viên.

## 💾 Dữ liệu và Validation

### 📝 Trường dữ liệu sinh viên

| Trường            | Yêu cầu  | Validation Rules                                      |
| ----------------- | -------- | ----------------------------------------------------- |
| **Mã sinh viên**  | Bắt buộc | Format: `111809XXXX` (X là 4 chữ số), không trùng lặp |
| **Họ tên**        | Bắt buộc | Ít nhất 2 ký tự                                       |
| **Giới tính**     | Bắt buộc | Nam/Nữ                                                |
| **Ngày sinh**     | Bắt buộc | Tuổi từ 16-50                                         |
| **Lớp**           | Bắt buộc | Không để trống                                        |
| **Khoa**          | Bắt buộc | Chọn từ danh sách có sẵn                              |
| **Email**         | Bắt buộc | Format email hợp lệ, không trùng lặp                  |
| **Số điện thoại** | Bắt buộc | 10-11 chữ số, bắt đầu bằng 0, không trùng lặp         |
| **Địa chỉ**       | Bắt buộc | Ít nhất 5 ký tự                                       |

### 🔍 Tính năng Validation

#### Real-time Validation

-   ✅ Kiểm tra ngay khi nhập (blur event)
-   ✅ Hiển thị lỗi bằng text màu đỏ dưới input
-   ✅ Clear lỗi khi người dùng bắt đầu nhập lại
-   ✅ Visual feedback với border đỏ cho input lỗi

#### Kiểm tra trùng lặp

-   ✅ Mã sinh viên không được trùng
-   ✅ Email không được trùng
-   ✅ Số điện thoại không được trùng
-   ✅ Cho phép giữ nguyên thông tin khi sửa

### 💾 Lưu trữ và Backup

-   **Storage:** Browser localStorage
-   **Auto-save:** Tự động lưu khi thêm/sửa/xóa
-   **Session:** Duy trì đăng nhập khi refresh
-   **Data Recovery:** Khôi phục tự động khi mở lại

### 📊 Dữ liệu mẫu

Hệ thống có sẵn 5 sinh viên mẫu để test:

| Mã SV      | Họ tên         | Khoa                | Email               |
| ---------- | -------------- | ------------------- | ------------------- |
| 1118091001 | Nguyễn Văn An  | Công nghệ thông tin | an.nguyen@email.com |
| 1118091002 | Trần Thị Bình  | Công nghệ thông tin | binh.tran@email.com |
| 1118091003 | Lê Hoàng Cường | Kiến trúc xây dựng  | cuong.le@email.com  |
| 1118091004 | Phạm Thị Dung  | Kinh tế             | dung.pham@email.com |
| 1118091005 | Hoàng Văn Em   | Y học               | em.hoang@email.com  |

## 🛠 Công nghệ sử dụng

### Frontend Stack

-   **HTML5** - Cấu trúc semantic
-   **CSS3** - Styling với Grid/Flexbox
-   **JavaScript ES6+** - Logic ứng dụng
-   **Responsive Design** - Tương thích đa thiết bị

### Architecture & Patterns

-   **MVC Pattern** - Tách biệt logic và giao diện
-   **Component-based** - Tái sử dụng code
-   **Event-driven** - Xử lý sự kiện real-time
-   **Client-side Storage** - LocalStorage API

### Browser Compatibility

-   ✅ Chrome 80+
-   ✅ Firefox 75+
-   ✅ Safari 13+
-   ✅ Edge 80+

## 🔒 Tính năng bảo mật

### 🛡️ Bảo vệ dữ liệu

-   **Modal Protection** - Xác nhận trước khi đóng nếu có thay đổi
-   **Data Validation** - Kiểm tra đầu vào nghiêm ngặt
-   **Duplicate Prevention** - Ngăn chặn dữ liệu trùng lặp
-   **Session Management** - Quản lý phiên đăng nhập

### 🔐 Kiểm soát truy cập

-   **Role-based Access** - Chỉ admin có quyền
-   **Email Restriction** - Chỉ email cụ thể được phép
-   **Session Persistence** - Duy trì đăng nhập an toàn
-   **Auto Logout Protection** - Tự động đăng xuất khi cần

### 🎯 UX/UI Security

-   **No Accidental Close** - Modal không đóng khi click outside
-   **Confirmation Dialogs** - Xác nhận trước khi xóa/thay đổi
-   **Error Feedback** - Thông báo lỗi rõ ràng, không popup phiền nhiễu
-   **Keyboard Support** - ESC để đóng, Enter để submit

## ❓ FAQ và Troubleshooting

### 🐛 Vấn đề thường gặp

**Q: Tại sao tôi không thể đăng nhập?**

-   A: Đảm bảo sử dụng email `phuonganh@gmail.com` với vai trò Admin

**Q: Dữ liệu bị mất khi refresh trang?**

-   A: Hệ thống tự động lưu vào localStorage. Nếu mất, kiểm tra:
    -   Trình duyệt có chặn localStorage không
    -   Có đang ở chế độ incognito không
    -   Cache browser có bị xóa không

**Q: Validation báo lỗi không đúng?**

-   A: Kiểm tra format dữ liệu:
    -   Mã SV: `111809XXXX` (8 chữ số)
    -   Email: format chuẩn (`abc@domain.com`)
    -   SĐT: 10-11 chữ số, bắt đầu bằng 0

**Q: Không xuất được file Excel?**

-   A: Kiểm tra trình duyệt có chặn download không

**Q: Modal không đóng được?**

-   A: Sử dụng nút X, nút Hủy, hoặc phím ESC. Click outside không hoạt động để bảo vệ dữ liệu.

### 🔧 Debug Mode

Mở Developer Tools (F12) để xem console log và kiểm tra lỗi.

## � Tính năng nâng cao

### 🎨 UX Improvements

-   **Real-time Search** - Tìm kiếm không cần bấm nút
-   **Smart Sorting** - Sắp xếp theo tên cuối (kiểu Việt Nam)
-   **Inline Validation** - Lỗi hiển thị ngay dưới input
-   **Progress Feedback** - Loading states và success messages

### 📊 Data Management

-   **Auto-save** - Lưu tự động mọi thay đổi
-   **Data Integrity** - Kiểm tra tính toàn vẹn dữ liệu
-   **Backup/Restore** - Sao lưu và khôi phục (trong code)
-   **Export Features** - Xuất CSV với encoding UTF-8

### 🚀 Performance

-   **Pagination** - Chỉ hiển thị 10 records/trang
-   **Lazy Loading** - Tải components khi cần
-   **Event Debouncing** - Giảm thiểu API calls
-   **Memory Management** - Quản lý bộ nhớ hiệu quả

## 🎖️ Tính năng đặc biệt

### 🎯 Smart Features

-   **Intelligent Modal** - Chỉ đóng khi có xác nhận
-   **Vietnamese Name Sorting** - Sắp xếp theo tên cuối
-   **Context-aware Validation** - Validation theo ngữ cảnh
-   **Auto-recovery** - Tự động khôi phục session

### 🔄 Future Roadmap

-   [ ] Database integration (MySQL/PostgreSQL)
-   [ ] RESTful API backend
-   [ ] Photo upload cho sinh viên
-   [ ] Export PDF reports
-   [ ] Advanced search filters
-   [ ] Bulk operations (import/export Excel)
-   [ ] Email notifications
-   [ ] Dark mode theme

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. **Fork** dự án
2. **Create branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** thay đổi (`git commit -m 'Add AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Tạo Pull Request**

## 📄 License

Dự án này được phát hành dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👨‍💻 Tác giả

**Phương Anh**

-   Email: phuonganh@gmail.com
-   GitHub: [Xem repository](https://github.com/your-username/kiem_thu_qly_sinhvien)

## � Lời cảm ơn

-   Cảm ơn tất cả những người đã đóng góp và hỗ trợ phát triển dự án
-   Cảm ơn community JavaScript và Web Development
-   Cảm ơn các công cụ mã nguồn mở đã sử dụng

## 📞 Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. **Kiểm tra FAQ** ở trên trước
2. **Mở Issue** trên GitHub
3. **Email trực tiếp:** phuonganh@gmail.com

---

⭐ **Nếu dự án hữu ích, hãy cho chúng tôi một star!** ⭐

**Version:** 1.0.0 | **Last Updated:** November 2025
