-- Tạo database
CREATE DATABASE IF NOT EXISTS student_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE student_management;

-- Bảng users (Người dùng hệ thống)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng students (Sinh viên)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã sinh viên',
    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
    date_of_birth DATE NOT NULL COMMENT 'Ngày sinh',
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL COMMENT 'Giới tính',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email',
    phone VARCHAR(15) NOT NULL UNIQUE COMMENT 'Số điện thoại',
    address TEXT NOT NULL COMMENT 'Địa chỉ',
    class VARCHAR(50) NOT NULL COMMENT 'Lớp',
    department VARCHAR(100) NOT NULL COMMENT 'Khoa',
    status ENUM('Đang học', 'Bảo lưu', 'Thôi học') DEFAULT 'Đang học' COMMENT 'Trạng thái học tập',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL COMMENT 'ID người tạo',
    updated_by INT NULL COMMENT 'ID người cập nhật',
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_class (class),
    INDEX idx_department (department),
    INDEX idx_status (status),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho bảng users
-- Password cho tất cả: 123456 (đã mã hóa bằng bcrypt)
INSERT INTO users (username, email, password, full_name, role, is_active) VALUES
('admin', 'phuonganh@gmail.com', '$2a$10$xhabRDt8EDZvxkgk3vo43ekptQ1i.NVTmM2qGmf958jtIpo/8qkw.', 'Phương Anh', 'admin', TRUE),
('user', 'user@gmail.com', '$2a$10$xhabRDt8EDZvxkgk3vo43ekptQ1i.NVTmM2qGmf958jtIpo/8qkw.', 'Người dùng', 'user', TRUE);

-- Thêm dữ liệu mẫu cho bảng students
INSERT INTO students (student_id, full_name, date_of_birth, gender, email, phone, address, class, department, created_by) VALUES
('1118090001', 'Nguyễn Văn An', '2003-05-15', 'Nam', 'nguyenvanan@gmail.com', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 'KTPM-K17', 'Công nghệ thông tin', 1),
('1118090002', 'Trần Thị Bình', '2003-08-20', 'Nữ', 'tranthibinh@gmail.com', '0987654321', '456 Đường XYZ, Quận 3, TP.HCM', 'CNTT-K17', 'Công nghệ thông tin', 1),
('1118090003', 'Lê Văn Cường', '2003-03-10', 'Nam', 'levancuong@gmail.com', '0369258147', '789 Đường DEF, Quận 5, TP.HCM', 'KTPM-K17', 'Công nghệ thông tin', 1),
('1118090004', 'Phạm Thị Dung', '2003-11-25', 'Nữ', 'phamthidung@gmail.com', '0147258369', '321 Đường GHI, Quận 7, TP.HCM', 'HTTT-K17', 'Hệ thống thông tin', 1),
('1118090005', 'Hoàng Văn Em', '2003-07-08', 'Nam', 'hoangvanem@gmail.com', '0258369147', '654 Đường JKL, Quận 10, TP.HCM', 'KHMT-K17', 'Khoa học máy tính', 1);

-- Tạo view để xem thống kê
CREATE OR REPLACE VIEW student_statistics AS
SELECT 
    department,
    class,
    COUNT(*) AS total_students,
    SUM(CASE WHEN gender = 'Nam' THEN 1 ELSE 0 END) AS male_count,
    SUM(CASE WHEN gender = 'Nữ' THEN 1 ELSE 0 END) AS female_count
FROM students
GROUP BY department, class;

-- Hiển thị thông tin
SELECT 'Database setup completed!' AS Status;
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalStudents FROM students;
