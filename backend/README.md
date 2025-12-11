# Backend - Hệ thống Quản lý Sinh viên

## Các dependency được sử dụng

-   **express**: Web framework cho Node.js
-   **mysql2**: Driver MySQL với Promise support
-   **cors**: Xử lý Cross-Origin Resource Sharing
-   **dotenv**: Quản lý biến môi trường
-   **bcryptjs**: Mã hóa mật khẩu
-   **express-session**: Quản lý session

## Cấu trúc thư mục

```
backend/
├── config/
│   └── database.js        # Cấu hình kết nối MySQL
├── database/
│   └── schema.sql         # SQL schema
├── routes/
│   ├── auth.js            # Authentication routes
│   └── students.js        # Student management routes
├── .env                   # Environment variables
├── .env.example           # Template for .env
├── package.json
└── server.js              # Entry point
```

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` từ `.env.example` và cập nhật thông tin:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
DB_PORT=3306

PORT=3000
SESSION_SECRET=your_secret_key

CORS_ORIGIN=http://127.0.0.1:5500
```

## Chạy server

```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## API Documentation

Xem chi tiết tại [SETUP.md](../SETUP.md) ở thư mục gốc.
