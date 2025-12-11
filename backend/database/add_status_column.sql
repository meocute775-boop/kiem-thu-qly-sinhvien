-- Migration: Thêm cột status vào bảng students
USE student_management;

-- Thêm cột status nếu chưa tồn tại
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS status ENUM('Đang học', 'Bảo lưu', 'Thôi học') 
DEFAULT 'Đang học' 
COMMENT 'Trạng thái học tập' 
AFTER department;

-- Tạo index cho cột status
CREATE INDEX IF NOT EXISTS idx_status ON students(status);

-- Cập nhật tất cả sinh viên hiện tại thành trạng thái "Đang học"
UPDATE students SET status = 'Đang học' WHERE status IS NULL;

SELECT 'Migration completed: Added status column to students table' AS message;
