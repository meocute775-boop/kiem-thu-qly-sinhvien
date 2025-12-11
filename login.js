// Hệ thống đăng nhập cho quản lý sinh viên

// Toast notification system
function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
    const bgColor =
        type === "success"
            ? "#10b981"
            : type === "error"
            ? "#ef4444"
            : "#3b82f6";

    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 300px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;

    toast.innerHTML = `
        <span style="font-size: 20px;">${icon}</span>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    const style = document.createElement("style");
    if (!document.getElementById("toastAnimations")) {
        style.id = "toastAnimations";
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", async function () {
    // Kiểm tra xem đã đăng nhập chưa
    const userRole = sessionStorage.getItem("userRole");
    const username = sessionStorage.getItem("username");

    // Nếu có session trong sessionStorage, cho phép vào luôn
    // Sẽ verify khi gọi API thực tế
    if (userRole === "admin" && username) {
        // Có session, chuyển thẳng đến trang quản lý
        showStudentManagement();
        return;
    }

    // Chưa đăng nhập, hiển thị giao diện đăng nhập
    createLoginInterface();
});

function createLoginInterface() {
    document.body.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <h2>Đăng nhập hệ thống</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="role">Vai trò:</label>
                        <select id="role" required>
                            <option value="">Chọn vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="username">Username/Email:</label>
                        <input type="text" id="username" placeholder="phuonganh@gmail.com" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mật khẩu:</label>
                        <input type="password" id="password" placeholder="123456" required>
                    </div>
                    <button type="submit">Đăng nhập</button>
                </form>
            </div>
        </div>
        
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            html, body {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            
            html::-webkit-scrollbar, body::-webkit-scrollbar {
                display: none;
            }
            
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .login-container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                padding: 40px;
                width: 400px;
            }
            
            .login-box h2 {
                text-align: center;
                margin-bottom: 30px;
                color: #333;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #555;
                font-weight: bold;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            
            button {
                width: 100%;
                padding: 12px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            button:hover {
                background: #5a6fd8;
            }
            
            .nav-links {
                margin-top: 20px;
                text-align: center;
            }
            
            .nav-links a {
                display: inline-block;
                margin: 5px 10px;
                color: #667eea;
                text-decoration: none;
                font-size: 14px;
            }
            
            .nav-links a:hover {
                text-decoration: underline;
            }
        </style>
    `;

    // Xử lý đăng nhập
    document
        .getElementById("loginForm")
        .addEventListener("submit", async function (e) {
            e.preventDefault();

            const role = document.getElementById("role").value;
            const email = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Validate input
            if (!role || !email || !password) {
                showToast("Vui lòng điền đầy đủ thông tin!", "error");
                return;
            }

            try {
                // Gọi API đăng nhập
                const response = await apiService.login(email, password);

                if (response.success) {
                    const userData = response.data;

                    // Kiểm tra role phù hợp
                    if (role === "admin" && userData.role !== "admin") {
                        showToast("Bạn không có quyền admin!", "error");
                        return;
                    }

                    if (role === "user" && userData.role === "admin") {
                        showToast("Vui lòng chọn đúng vai trò!", "error");
                        return;
                    }

                    // Lưu thông tin đăng nhập
                    sessionStorage.setItem("userRole", userData.role);
                    sessionStorage.setItem("username", userData.email);
                    sessionStorage.setItem("userId", userData.id);
                    sessionStorage.setItem("fullName", userData.fullName);

                    // Chuyển đến trang quản lý nếu là admin
                    if (userData.role === "admin") {
                        showToast("Đăng nhập thành công!", "success");
                        setTimeout(() => showStudentManagement(), 500);
                    } else {
                        showToast(
                            "User role chưa được hỗ trợ. Vui lòng đăng nhập với admin!",
                            "error"
                        );
                    }
                } else {
                    showToast(
                        response.message || "Đăng nhập thất bại!",
                        "error"
                    );
                }
            } catch (error) {
                console.error("Login error:", error);
                showToast(error.message || "Lỗi kết nối đến server!", "error");
            }
        });
}

function validateLogin(role, username, password) {
    // Thông tin đăng nhập mặc định
    const validCredentials = {
        admin: {
            username: "phuonganh@gmail.com",
            password: "123456",
        },
        user: {
            username: "user@gmail.com",
            password: "123456",
        },
    };

    return (
        validCredentials[role] &&
        validCredentials[role].username === username &&
        validCredentials[role].password === password
    );
}

function showStudentManagement() {
    // Tải giao diện quản lý sinh viên
    if (typeof loadStudentManagement === "function") {
        // Check và restore view trước (detail view hoặc list view)
        checkAndRestoreView().then((isDetailView) => {
            if (!isDetailView) {
                // Nếu không phải detail view, load list view và restore filter
                loadStudentManagement().then(() => {
                    restoreFilterState();
                    loadStudentsFromAPI();
                });
            }
        });
    } else {
        // Load file studentManagement.js
        const script = document.createElement("script");
        script.src = "studentManagement.js";
        script.onload = function () {
            // Check và restore view sau khi load xong script
            checkAndRestoreView().then((isDetailView) => {
                if (!isDetailView) {
                    loadStudentManagement().then(() => {
                        restoreFilterState();
                        loadStudentsFromAPI();
                    });
                }
            });
        };
        document.head.appendChild(script);
    }
}

function showAddStudent() {
    showStudentManagement();
}
