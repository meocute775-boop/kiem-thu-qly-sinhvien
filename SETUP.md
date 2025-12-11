# 🎓 Hướng dẫn Setup Hệ thống Quản lý Sinh viên với MySQL

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Backend](#cài-đặt-backend)
3. [Thiết lập Database](#thiết-lập-database)
4. [Chạy ứng dụng](#chạy-ứng-dụng)
5. [Cấu trúc dự án](#cấu-trúc-dự-án)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu cầu hệ thống

### Cần cài đặt:

-   **Node.js** (v14 trở lên) - [Download tại đây](https://nodejs.org/)
-   **MySQL** (v5.7 trở lên hoặc v8.0) - [Download tại đây](https://dev.mysql.com/downloads/mysql/)
-   **XAMPP** hoặc **MySQL Workbench** (tuỳ chọn) - Để quản lý database dễ dàng hơn

---

## 🚀 Cài đặt Backend

### Bước 1: Cài đặt dependencies

Mở terminal/command prompt và chạy:

```bash
cd backend
npm install
```

Các package sẽ được cài đặt:

-   `express` - Web framework
-   `mysql2` - MySQL driver
-   `cors` - Cross-Origin Resource Sharing
-   `dotenv` - Environment variables
-   `bcryptjs` - Mã hóa mật khẩu
-   `express-session` - Session management

### Bước 2: Cấu hình môi trường

1. Mở file `.env` trong thư mục `backend/`
2. Cập nhật thông tin kết nối MySQL của bạn:

```env
# Cấu hình Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=           # Để trống nếu không có password
DB_NAME=student_management
DB_PORT=3306

# Cấu hình Server
PORT=3000
SESSION_SECRET=student_management_secret_key_2025

# CORS Origin (URL frontend)
CORS_ORIGIN=http://127.0.0.1:5500
```

**Lưu ý:**

-   Nếu dùng XAMPP: `DB_PASSWORD` thường để trống
-   Nếu tự cài MySQL: nhập password bạn đã đặt khi cài đặt

---

## 🗄️ Thiết lập Database

### Cách 1: Sử dụng MySQL Command Line

1. Mở MySQL Command Line Client hoặc terminal:

```bash
mysql -u root -p
```

2. Chạy file SQL để tạo database và bảng:

```bash
source d:/MONHOC/Kiem_thu/kiem_thu_qly_sinhvien/backend/database/schema.sql
```

### Cách 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến MySQL Server
3. Mở file `backend/database/schema.sql`
4. Nhấn biểu tượng ⚡ (lightning) để thực thi toàn bộ script

### Cách 3: Sử dụng phpMyAdmin (XAMPP)

1. Mở trình duyệt và truy cập: `http://localhost/phpmyadmin`
2. Click vào tab "SQL"
3. Copy toàn bộ nội dung file `backend/database/schema.sql`
4. Paste vào và nhấn "Go"

### Kiểm tra Database

Sau khi chạy script, database sẽ có:

**Bảng `users`:**

-   Admin: `phuonganh@gmail.com` / `123456`
-   User: `user@gmail.com` / `123456`

**Bảng `students`:**

-   5 sinh viên mẫu để test

Bạn có thể kiểm tra bằng câu lệnh SQL:

```sql
USE student_management;
SELECT * FROM users;
SELECT * FROM students;
```

---

## ▶️ Chạy ứng dụng

### 1. Khởi động Backend Server

```bash
cd backend
npm start
```

Hoặc sử dụng nodemon để auto-reload khi code thay đổi:

```bash
npm run dev
```

Bạn sẽ thấy thông báo:

```
🚀 Server đang chạy tại http://localhost:3000
📊 Database: student_management
🌐 CORS Origin: http://127.0.0.1:5500
✅ Kết nối MySQL thành công!
```

### 2. Khởi động Frontend

**Cách 1: Sử dụng Live Server (VS Code Extension)**

1. Cài extension "Live Server" trong VS Code
2. Right-click vào file `index.html`
3. Chọn "Open with Live Server"
4. Trình duyệt sẽ tự động mở tại `http://127.0.0.1:5500`

**Cách 2: Sử dụng Python HTTP Server**

```bash
# Python 3
python -m http.server 5500

# Hoặc Python 2
python -m SimpleHTTPServer 5500
```

**Cách 3: Double-click file `index.html`**

-   Lưu ý: Cách này có thể gặp lỗi CORS

### 3. Truy cập ứng dụng

Mở trình duyệt và truy cập: `http://127.0.0.1:5500`

**Đăng nhập với:**

-   **Role:** Admin
-   **Email:** `phuonganh@gmail.com`
-   **Password:** `123456`

---

## 📁 Cấu trúc dự án

```
kiem_thu_qly_sinhvien/
│
├── backend/                      # Backend Node.js + Express
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối MySQL
│   ├── database/
│   │   └── schema.sql           # SQL script tạo database
│   ├── routes/
│   │   ├── auth.js              # API authentication
│   │   └── students.js          # API quản lý sinh viên
│   ├── .env                     # Biến môi trường (CẤU HÌNH ĐI!)
│   ├── .env.example             # Template .env
│   ├── package.json             # Dependencies
│   └── server.js                # Entry point
│
├── api/
│   └── apiService.js            # Service layer gọi API
│
├── views/
│   ├── adminView.js             # Giao diện quản lý (dùng API)
│   ├── adminView_backup.js      # Backup phiên bản cũ
│   └── back_end/
│       └── qly_sinhvien.js      # Logic cũ (không dùng nữa)
│
├── index.html                   # Entry point frontend
├── login.js                     # Xử lý đăng nhập
├── README.md                    # Tài liệu gốc
└── SETUP.md                     # File này
```

---

## 🔌 API Endpoints

### Authentication APIs

#### POST `/api/auth/login`

Đăng nhập

**Request:**

```json
{
    "email": "phuonganh@gmail.com",
    "password": "123456"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
        "id": 1,
        "username": "admin",
        "email": "phuonganh@gmail.com",
        "fullName": "Phương Anh",
        "role": "admin"
    }
}
```

#### POST `/api/auth/logout`

Đăng xuất

#### GET `/api/auth/me`

Lấy thông tin user hiện tại

#### POST `/api/auth/register`

Đăng ký tài khoản mới

#### PUT `/api/auth/change-password`

Đổi mật khẩu

---

### Student APIs

#### GET `/api/students`

Lấy danh sách sinh viên (có phân trang, tìm kiếm, lọc)

**Query Parameters:**

-   `page` - Trang hiện tại (default: 1)
-   `limit` - Số sinh viên mỗi trang (default: 10)
-   `search` - Từ khóa tìm kiếm
-   `department` - Lọc theo khoa
-   `class` - Lọc theo lớp
-   `gender` - Lọc theo giới tính
-   `sortBy` - Sắp xếp theo field (default: created_at)
-   `order` - ASC hoặc DESC (default: DESC)

**Example:**

```
GET /api/students?page=1&limit=10&search=Nguyễn&department=Công nghệ thông tin
```

#### GET `/api/students/:id`

Lấy thông tin 1 sinh viên

#### POST `/api/students`

Thêm sinh viên mới

**Request:**

```json
{
    "studentId": "1118090001",
    "fullName": "Nguyễn Văn An",
    "dateOfBirth": "2003-05-15",
    "gender": "Nam",
    "email": "an@gmail.com",
    "phone": "0123456789",
    "address": "123 ABC, TP.HCM",
    "class": "KTPM-K17",
    "department": "Công nghệ thông tin"
}
```

#### PUT `/api/students/:id`

Cập nhật thông tin sinh viên

#### DELETE `/api/students/:id`

Xóa 1 sinh viên

#### POST `/api/students/bulk-delete`

Xóa nhiều sinh viên

**Request:**

```json
{
    "ids": [1, 2, 3]
}
```

#### GET `/api/students/statistics/summary`

Lấy thống kê tổng quan

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Cannot connect to MySQL"

**Nguyên nhân:**

-   MySQL chưa chạy
-   Thông tin kết nối trong `.env` sai

**Giải pháp:**

1. Kiểm tra MySQL đang chạy:
    - XAMPP: Bật "Start" ở MySQL
    - Windows Service: Mở Services → MySQL → Start
2. Kiểm tra thông tin trong `.env`:

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=          # Password của bạn
    DB_PORT=3306
    ```

3. Test kết nối MySQL:
    ```bash
    mysql -u root -p
    ```

---

### ❌ Lỗi: "CORS Policy Blocked"

**Nguyên nhân:**

-   Frontend chạy ở domain/port khác với backend
-   Cấu hình CORS chưa đúng

**Giải pháp:**

1. Kiểm tra frontend đang chạy ở port nào (thường là 5500)
2. Cập nhật `.env`:
    ```env
    CORS_ORIGIN=http://127.0.0.1:5500
    ```
3. Restart backend server

---

### ❌ Lỗi: "npm install failed"

**Giải pháp:**

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

---

### ❌ Lỗi: "Port 3000 already in use"

**Giải pháp:**

**Windows:**

```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay <PID> bằng số PID tìm được)
taskkill /PID <PID> /F
```

**Hoặc đổi port trong `.env`:**

```env
PORT=3001
```

---

### ❌ Database không có dữ liệu

**Giải pháp:**

1. Kiểm tra file `schema.sql` đã chạy chưa
2. Chạy lại script:
    ```bash
    mysql -u root -p student_management < backend/database/schema.sql
    ```

---

## 📝 Ghi chú quan trọng

### Validation Rules

**Mã sinh viên:**

-   Format: `111809XXXX` (X = 4 chữ số)
-   Không trùng lặp

**Email:**

-   Format chuẩn
-   Không trùng lặp

**Số điện thoại:**

-   10-11 chữ số
-   Bắt đầu bằng 0
-   Không trùng lặp

**Tuổi:**

-   Từ 16-50 tuổi

---

## 🔐 Security Notes

-   Mật khẩu được mã hóa bằng **bcrypt**
-   Session được lưu trên server
-   Cần đổi `SESSION_SECRET` trong production
-   Không commit file `.env` lên Git

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra console log trong trình duyệt (F12)
2. Kiểm tra terminal backend có báo lỗi không
3. Kiểm tra MySQL có chạy không

---

## ✅ Checklist Khởi động

-   [ ] Đã cài Node.js
-   [ ] Đã cài MySQL
-   [ ] Đã chạy `npm install` trong thư mục backend
-   [ ] Đã cấu hình file `.env`
-   [ ] Đã chạy file `schema.sql` để tạo database
-   [ ] MySQL đang chạy
-   [ ] Backend server đang chạy tại `http://localhost:3000`
-   [ ] Frontend đang chạy tại `http://127.0.0.1:5500`
-   [ ] Đã test đăng nhập thành công

---

**🎉 Chúc bạn setup thành công!**
