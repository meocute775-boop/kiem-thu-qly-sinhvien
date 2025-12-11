const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { requireAuth } = require("./auth");

// Middleware lấy userId từ session
const getUserId = (req, res, next) => {
    req.userId = req.session.userId;
    next();
};

// Tạm thời comment requireAuth để test
// router.use(requireAuth);
router.use(getUserId);

// GET /api/students - Lấy danh sách sinh viên (có phân trang, tìm kiếm, lọc)
router.get("/", async (req, res) => {
    console.log("📊 GET /api/students - Session:", req.session);
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            department = "",
            class: className = "",
            gender = "",
            status = "",
            sortBy = "created_at",
            order = "DESC",
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push(`(
                student_id LIKE ? OR 
                full_name LIKE ? OR 
                email LIKE ? OR 
                phone LIKE ?
            )`);
            const searchPattern = `%${search}%`;
            queryParams.push(
                searchPattern,
                searchPattern,
                searchPattern,
                searchPattern
            );
        }

        if (department) {
            whereConditions.push("department = ?");
            queryParams.push(department);
        }

        if (className) {
            whereConditions.push("class = ?");
            queryParams.push(className);
        }

        if (gender) {
            whereConditions.push("gender = ?");
            queryParams.push(gender);
        }

        if (status) {
            whereConditions.push("status = ?");
            queryParams.push(status);
        }

        const whereClause =
            whereConditions.length > 0
                ? "WHERE " + whereConditions.join(" AND ")
                : "";

        // Validate sortBy to prevent SQL injection
        const allowedSortFields = [
            "student_id",
            "full_name",
            "date_of_birth",
            "email",
            "class",
            "department",
            "status",
            "created_at",
        ];
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "created_at";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Xử lý sắp xếp đặc biệt
        let orderByClause;
        if (sortField === "full_name") {
            // Sắp xếp theo tên (chữ cuối) thay vì họ
            orderByClause = `SUBSTRING_INDEX(full_name, ' ', -1) ${sortOrder}`;
        } else if (sortField === "student_id") {
            // Sắp xếp mã SV theo số (numeric) thay vì chuỗi
            orderByClause = `CAST(student_id AS UNSIGNED) ${sortOrder}`;
        } else {
            orderByClause = `${sortField} ${sortOrder}`;
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM students ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // Get students
        const [students] = await db.query(
            `SELECT * FROM students ${whereClause} 
             ORDER BY ${orderByClause} 
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), offset]
        );

        res.json({
            success: true,
            data: students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách sinh viên",
            error: error.message,
        });
    }
});

// GET /api/students/:id - Lấy thông tin một sinh viên
router.get("/:id", async (req, res) => {
    try {
        const [students] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên",
            });
        }

        const student = students[0];

        // Format date_of_birth to DD/MM/YYYY
        if (student.date_of_birth) {
            // MySQL returns Date object - use UTC methods to avoid timezone issues
            const date = student.date_of_birth;
            let day, month, year;

            if (date instanceof Date) {
                // Use UTC methods to get the exact date stored in database
                year = date.getUTCFullYear();
                month = String(date.getUTCMonth() + 1).padStart(2, "0");
                day = String(date.getUTCDate()).padStart(2, "0");
            } else {
                // If it's a string
                const dateStr = String(date).split("T")[0];
                [year, month, day] = dateStr.split("-");
            }

            student.date_of_birth = `${day}/${month}/${year}`;
        }

        res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        console.error("Get student error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy thông tin sinh viên",
            error: error.message,
        });
    }
});

// POST /api/students - Thêm sinh viên mới
router.post("/", async (req, res) => {
    try {
        const {
            student_id: studentId,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            gender,
            email,
            phone,
            address,
            class: className,
            department,
            status = "Đang học",
        } = req.body;

        // Log dữ liệu nhận được để debug
        console.log("📥 Dữ liệu nhận được:", {
            studentId,
            fullName,
            dateOfBirth,
            gender,
            email,
            phone,
            address,
            className,
            department,
        });

        // Validate required fields - chi tiết từng trường
        const missingFields = [];
        if (!studentId) missingFields.push("Mã SV");
        if (!fullName) missingFields.push("Họ tên");
        if (!dateOfBirth) missingFields.push("Ngày sinh");
        if (!gender) missingFields.push("Giới tính");
        if (!email) missingFields.push("Email");
        if (!phone) missingFields.push("SĐT");
        if (!address) missingFields.push("Địa chỉ");
        if (!className) missingFields.push("Lớp");
        if (!department) missingFields.push("Khoa");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Thiếu thông tin: ${missingFields.join(", ")}`,
            });
        }

        // Validate mã sinh viên format
        if (!/^111809\d{4}$/.test(studentId)) {
            return res.status(400).json({
                success: false,
                message:
                    "Mã sinh viên phải có định dạng 111809XXXX (X là 4 chữ số)",
            });
        }

        // Validate họ tên phải có ít nhất 2 từ
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Họ tên phải có ít nhất 2 từ (VD: Nguyễn An)",
            });
        }

        if (fullName.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Họ tên quá ngắn, vui lòng nhập đầy đủ",
            });
        }

        // Chặn ký tự đặc biệt trong họ tên
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
            return res.status(400).json({
                success: false,
                message: "Họ tên không được chứa số hoặc ký tự đặc biệt",
            });
        }

        // Kiểm tra mỗi từ phải có ý nghĩa (có nguyên âm, không phải chuỗi ngẫu nhiên)
        console.log("[POST /] Validating name:", fullName);
        console.log("[POST /] Name parts:", nameParts);
        const vietnameseVowels =
            /[aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ]/i;
        const invalidWord = nameParts.find((word) => {
            // Mỗi từ phải có ít nhất 1 nguyên âm
            if (!vietnameseVowels.test(word)) return true;
            // Không cho phép quá 10 phụ âm liên tiếp (nới lỏng từ 8 lên 10)
            if (/[bcdfghjklmnpqrstvwxyz]{11,}/i.test(word)) return true;
            // Độ dài từ hợp lý - cho phép tên 1 ký tự (A, B, C...)
            if (word.length < 1 || word.length > 20) return true;

            // Kiểm tra tỷ lệ nguyên âm/phụ âm hợp lý - nới lỏng để chấp nhận hầu hết tên tiếng Việt
            const vowelCount = (word.match(vietnameseVowels) || []).length;
            const consonantCount = word.length - vowelCount;
            // Nới lỏng: chỉ chặn nếu quá 10 lần (chấp nhận Hoàng, Minh, Thắng, Trịnh, Nhật, Nghĩa...)
            if (vowelCount > 0 && consonantCount > vowelCount * 10) return true;

            // Không có 3 nguyên âm liên tiếp giống nhau
            if (
                /([aeiouàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])\1{2,}/i.test(
                    word
                )
            )
                return true;

            return false;
        });

        if (invalidWord) {
            return res.status(400).json({
                success: false,
                message: "Tên không hợp lệ, vui lòng nhập lại",
            });
        }

        // Validate email format - yêu cầu domain hợp lệ
        const emailRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,}@[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ (VD: example@gmail.com)",
            });
        }

        // Kiểm tra độ dài và cấu trúc email
        if (email.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Email quá ngắn",
            });
        }

        const emailParts = email.split("@");
        if (emailParts[0].length < 2 || emailParts[1].length < 4) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ",
            });
        }

        // Kiểm tra domain phổ biến
        const domain = emailParts[1].toLowerCase();
        const validDomains = [
            "gmail.com",
            "yahoo.com",
            "yahoo.com.vn",
            "outlook.com",
            "hotmail.com",
            "icloud.com",
            "live.com",
            "edu.vn",
            "hcmus.edu.vn",
            "uit.edu.vn",
            "hcmut.edu.vn",
            "ulsa.edu.vn",
            "student.ulsa.edu.vn",
            "ulsa.edu.com",
            "student.hcmus.edu.vn",
            "mail.com",
        ];

        if (!validDomains.includes(domain)) {
            return res.status(400).json({
                success: false,
                message:
                    "Chỉ chấp nhận email của Gmail, Yahoo, Outlook, Hotmail, iCloud hoặc email trường học (ulsa.edu.vn, ulsa.edu.com)",
            });
        }

        // Validate phone format
        if (!/^0\d{9,10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0",
            });
        }

        // Validate age (16-50)
        const birthDate = new Date(dateOfBirth);
        const age = Math.floor(
            (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 16 || age > 50) {
            return res.status(400).json({
                success: false,
                message: "Tuổi sinh viên phải từ 16 đến 50",
            });
        }

        // Validate lớp (chỉ cho phép chữ, số, gạch ngang)
        if (!/^[a-zA-Z0-9\-]+$/.test(className)) {
            return res.status(400).json({
                success: false,
                message: "Lớp chỉ được chứa chữ, số và dấu gạch ngang",
            });
        }

        // Validate địa chỉ
        if (address.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ phải có ít nhất 5 ký tự",
            });
        }

        if (!/^[a-zA-Z0-9À-ỹ\s,.\-/]+$/.test(address)) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ chứa ký tự không hợp lệ",
            });
        }

        // Check duplicates
        const [duplicates] = await db.query(
            "SELECT student_id, email, phone FROM students WHERE student_id = ? OR email = ? OR phone = ?",
            [studentId, email, phone]
        );

        if (duplicates.length > 0) {
            const duplicate = duplicates[0];
            if (duplicate.student_id === studentId) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sinh viên đã tồn tại",
                });
            }
            if (duplicate.email === email) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã được sử dụng",
                });
            }
            if (duplicate.phone === phone) {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại đã được sử dụng",
                });
            }
        }

        // Insert student
        const [result] = await db.query(
            `INSERT INTO students (student_id, full_name, date_of_birth, gender, email, phone, address, class, department, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                studentId,
                fullName,
                dateOfBirth,
                gender,
                email,
                phone,
                address,
                className,
                department,
                status,
                req.userId,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Thêm sinh viên thành công",
            data: {
                id: result.insertId,
                studentId,
                fullName,
                dateOfBirth,
                gender,
                email,
                phone,
                address,
                class: className,
                department,
            },
        });
    } catch (error) {
        console.error("Add student error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi thêm sinh viên",
            error: error.message,
        });
    }
});

// PUT /api/students/:id - Cập nhật sinh viên
router.put("/:id", async (req, res) => {
    try {
        const studentDbId = req.params.id;
        const {
            studentId,
            fullName,
            dateOfBirth,
            gender,
            email,
            phone,
            address,
            class: className,
            department,
        } = req.body;

        // Check if student exists
        const [existingStudent] = await db.query(
            "SELECT id FROM students WHERE id = ?",
            [studentDbId]
        );

        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên",
            });
        }

        // Validate required fields
        if (
            !studentId ||
            !fullName ||
            !dateOfBirth ||
            !gender ||
            !email ||
            !phone ||
            !address ||
            !className ||
            !department
        ) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }

        // Validate formats (same as POST)
        if (!/^111809\d{4}$/.test(studentId)) {
            return res.status(400).json({
                success: false,
                message: "Mã sinh viên phải có định dạng 111809XXXX",
            });
        }

        // Validate họ tên phải có ít nhất 2 từ
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Họ tên phải có ít nhất 2 từ (VD: Nguyễn An)",
            });
        }

        if (fullName.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Họ tên quá ngắn, vui lòng nhập đầy đủ",
            });
        }

        // Chặn ký tự đặc biệt trong họ tên
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
            return res.status(400).json({
                success: false,
                message: "Họ tên không được chứa số hoặc ký tự đặc biệt",
            });
        }

        // Kiểm tra mỗi từ phải có ý nghĩa (có nguyên âm, không phải chuỗi ngẫu nhiên)
        console.log("[PUT /:id] Validating name:", fullName);
        console.log("[PUT /:id] Name parts:", nameParts);
        const vietnameseVowels =
            /[aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ]/i;
        const invalidWord = nameParts.find((word) => {
            if (!vietnameseVowels.test(word)) return true;
            if (/[bcdfghjklmnpqrstvwxyz]{11,}/i.test(word)) return true;
            if (word.length < 1 || word.length > 20) return true;

            const vowelCount = (word.match(vietnameseVowels) || []).length;
            const consonantCount = word.length - vowelCount;
            if (vowelCount > 0 && consonantCount > vowelCount * 10) return true;

            if (
                /([aeiouàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])\1{2,}/i.test(
                    word
                )
            )
                return true;

            return false;
        });

        if (invalidWord) {
            return res.status(400).json({
                success: false,
                message: "Tên không hợp lệ, vui lòng nhập lại",
            });
        }

        // Validate email format - yêu cầu domain hợp lệ
        const emailRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,}@[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ (VD: example@gmail.com)",
            });
        }

        // Kiểm tra độ dài và cấu trúc email
        if (email.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Email quá ngắn",
            });
        }

        const emailParts = email.split("@");
        if (emailParts[0].length < 2 || emailParts[1].length < 4) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ",
            });
        }

        // Kiểm tra domain phổ biến (PUT route)
        const domain = emailParts[1].toLowerCase();
        const validDomains = [
            "gmail.com",
            "yahoo.com",
            "yahoo.com.vn",
            "outlook.com",
            "hotmail.com",
            "icloud.com",
            "live.com",
            "edu.vn",
            "hcmus.edu.vn",
            "uit.edu.vn",
            "hcmut.edu.vn",
            "ulsa.edu.vn",
            "student.ulsa.edu.vn",
            "ulsa.edu.com",
            "student.hcmus.edu.vn",
            "mail.com",
        ];

        if (!validDomains.includes(domain)) {
            return res.status(400).json({
                success: false,
                message:
                    "Chỉ chấp nhận email của Gmail, Yahoo, Outlook, Hotmail, iCloud hoặc email trường học (ulsa.edu.vn, ulsa.edu.com)",
            });
        }

        if (!/^0\d{9,10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0",
            });
        }

        // Validate age
        const birthDate = new Date(dateOfBirth);
        const age = Math.floor(
            (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 16 || age > 50) {
            return res.status(400).json({
                success: false,
                message: "Tuổi sinh viên phải từ 16 đến 50",
            });
        }

        // Check duplicates (excluding current student)
        const [duplicates] = await db.query(
            "SELECT student_id, email, phone FROM students WHERE (student_id = ? OR email = ? OR phone = ?) AND id != ?",
            [studentId, email, phone, studentDbId]
        );

        if (duplicates.length > 0) {
            const duplicate = duplicates[0];
            if (duplicate.student_id === studentId) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sinh viên đã tồn tại",
                });
            }
            if (duplicate.email === email) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã được sử dụng",
                });
            }
            if (duplicate.phone === phone) {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại đã được sử dụng",
                });
            }
        }

        // Update student
        await db.query(
            `UPDATE students 
             SET student_id = ?, full_name = ?, date_of_birth = ?, gender = ?, 
                 email = ?, phone = ?, address = ?, class = ?, department = ?, updated_by = ?
             WHERE id = ?`,
            [
                studentId,
                fullName,
                dateOfBirth,
                gender,
                email,
                phone,
                address,
                className,
                department,
                req.userId,
                studentDbId,
            ]
        );

        res.json({
            success: true,
            message: "Cập nhật sinh viên thành công",
            data: {
                id: studentDbId,
                studentId,
                fullName,
                dateOfBirth,
                gender,
                email,
                phone,
                address,
                class: className,
                department,
            },
        });
    } catch (error) {
        console.error("Update student error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật sinh viên",
            error: error.message,
        });
    }
});

// DELETE /api/students/:id - Xóa sinh viên
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM students WHERE id = ?", [
            req.params.id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên",
            });
        }

        res.json({
            success: true,
            message: "Xóa sinh viên thành công",
        });
    } catch (error) {
        console.error("Delete student error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi xóa sinh viên",
            error: error.message,
        });
    }
});

// PUT /api/students/:id/status - Cập nhật trạng thái sinh viên
router.put("/:id/status", async (req, res) => {
    try {
        const studentId = req.params.id;
        const { status } = req.body;

        // Validate status
        const validStatuses = ["Đang học", "Bảo lưu", "Thôi học"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái không hợp lệ. Chọn: Đang học, Bảo lưu hoặc Thôi học",
            });
        }

        // Check if student exists
        const [existingStudent] = await db.query(
            "SELECT id FROM students WHERE id = ?",
            [studentId]
        );

        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên",
            });
        }

        // Update status
        await db.query(
            "UPDATE students SET status = ?, updated_by = ? WHERE id = ?",
            [status, req.userId, studentId]
        );

        res.json({
            success: true,
            message: `Đã cập nhật trạng thái thành: ${status}`,
            data: { id: studentId, status },
        });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật trạng thái",
            error: error.message,
        });
    }
});

// POST /api/students/bulk-delete - Xóa nhiều sinh viên
router.post("/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn sinh viên để xóa",
            });
        }

        const placeholders = ids.map(() => "?").join(",");
        const [result] = await db.query(
            `DELETE FROM students WHERE id IN (${placeholders})`,
            ids
        );

        res.json({
            success: true,
            message: `Đã xóa ${result.affectedRows} sinh viên`,
            deletedCount: result.affectedRows,
        });
    } catch (error) {
        console.error("Bulk delete error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi xóa sinh viên",
            error: error.message,
        });
    }
});

// GET /api/students/statistics/summary - Thống kê
router.get("/statistics/summary", async (req, res) => {
    try {
        // Total students
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM students"
        );

        // By department
        const [byDepartment] = await db.query(
            "SELECT department, COUNT(*) as count FROM students GROUP BY department"
        );

        // By gender
        const [byGender] = await db.query(
            "SELECT gender, COUNT(*) as count FROM students GROUP BY gender"
        );

        // By class
        const [byClass] = await db.query(
            "SELECT class, COUNT(*) as count FROM students GROUP BY class ORDER BY count DESC LIMIT 10"
        );

        res.json({
            success: true,
            data: {
                total: totalResult[0].total,
                byDepartment,
                byGender,
                byClass,
            },
        });
    } catch (error) {
        console.error("Statistics error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy thống kê",
            error: error.message,
        });
    }
});

module.exports = router;
