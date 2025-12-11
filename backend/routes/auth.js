const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Middleware kiểm tra đăng nhập
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập để tiếp tục",
        });
    }
    next();
};

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
    try {
        const [users] = await db.query("SELECT role FROM users WHERE id = ?", [
            req.session.userId,
        ]);

        if (!users.length || users[0].role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập",
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi kiểm tra quyền",
        });
    }
};

// POST /api/auth/login - Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc",
            });
        }

        // Tìm user trong database
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng",
            });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng",
            });
        }

        // Cập nhật last_login
        await db.query(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            [user.id]
        );

        // Lưu thông tin vào session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;
        req.session.userName = user.full_name;

        // Trả về thông tin user (không bao gồm password)
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi đăng nhập",
            error: error.message,
        });
    }
});

// POST /api/auth/register - Đăng ký tài khoản mới
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, fullName, role = "user" } = req.body;

        // Validate input
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }

        // Kiểm tra email đã tồn tại
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc username đã tồn tại",
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới
        const [result] = await db.query(
            "INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
            [username, email, hashedPassword, fullName, role]
        );

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: {
                id: result.insertId,
                username,
                email,
                fullName,
                role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi đăng ký",
            error: error.message,
        });
    }
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get("/me", requireAuth, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, username, email, full_name, role, created_at, last_login FROM users WHERE id = ?",
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông tin user",
            });
        }

        res.json({
            success: true,
            data: {
                id: users[0].id,
                username: users[0].username,
                email: users[0].email,
                fullName: users[0].full_name,
                role: users[0].role,
                createdAt: users[0].created_at,
                lastLogin: users[0].last_login,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy thông tin user",
            error: error.message,
        });
    }
});

// POST /api/auth/logout - Đăng xuất
router.post("/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi đăng xuất",
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            success: true,
            message: "Đăng xuất thành công",
        });
    });
});

// PUT /api/auth/change-password - Đổi mật khẩu
router.put("/change-password", requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }

        // Lấy mật khẩu hiện tại
        const [users] = await db.query(
            "SELECT password FROM users WHERE id = ?",
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user",
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            users[0].password
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu hiện tại không đúng",
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        await db.query("UPDATE users SET password = ? WHERE id = ?", [
            hashedPassword,
            req.session.userId,
        ]);

        res.json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi đổi mật khẩu",
            error: error.message,
        });
    }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;
