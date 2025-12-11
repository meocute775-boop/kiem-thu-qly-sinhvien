const mysql = require("mysql2/promise");
require("dotenv").config();

// Cấu hình kết nối database
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_management",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00", // Lưu date dưới dạng UTC để tránh timezone issues
    dateStrings: true, // Trả về date dưới dạng string thay vì Date object
};

// Tạo connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Kết nối MySQL thành công!");
        connection.release();
        return true;
    } catch (error) {
        console.error("❌ Lỗi kết nối MySQL:", error.message);
        return false;
    }
};

// Gọi test connection khi khởi động
testConnection();

module.exports = pool;
