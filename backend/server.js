const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - Support both local and ngrok
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    process.env.CORS_ORIGIN,
    // Add your ngrok URL here when using ngrok, e.g.:
    // "https://your-ngrok-url.ngrok-free.dev"
].filter(Boolean); // Remove undefined values

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, Postman, curl)
            if (!origin) return callback(null, true);

            // Check if origin is in allowed list or is ngrok domain
            if (
                allowedOrigins.includes(origin) ||
                origin.includes(".ngrok-free.dev")
            ) {
                callback(null, true);
            } else {
                console.log("❌ Blocked origin:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set true nếu dùng HTTPS (ngrok)
            httpOnly: true,
            sameSite: "lax", // 'none' nếu cần cross-site với ngrok
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (1 tuần)
        },
        rolling: true, // Tự động gia hạn session mỗi lần request
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server đang hoạt động" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra trên server",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🌐 Allowed CORS Origins:`, allowedOrigins);
    console.log(`\n💡 Để dùng Ngrok:`);
    console.log(`   1. Chạy: ngrok http ${PORT}`);
    console.log(`   2. Copy ngrok URL và paste vào api/apiService.js`);
    console.log(`   3. Mở NGROK_SETUP.md để xem hướng dẫn chi tiết\n`);
});
