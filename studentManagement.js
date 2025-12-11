// Quản lý sinh viên - Phiên bản mới theo yêu cầu
let students = [];
let currentPage = 1;
let studentsPerPage = 10;
let totalStudents = 0;
let currentStudentDetail = null; // Lưu thông tin sinh viên đang xem chi tiết

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
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;

    toast.innerHTML = `
        <span style="font-size: 20px; font-weight: bold;">${icon}</span>
        <span style="flex: 1;">${message}</span>
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
            @media (max-width: 768px) {
                #toastContainer {
                    top: 10px !important;
                    right: 10px !important;
                    left: 10px !important;
                    width: calc(100% - 20px) !important;
                }
                #toastContainer > div {
                    min-width: unset !important;
                    max-width: unset !important;
                    width: 100% !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    }, 3000);
}

// Custom confirm dialog
function showConfirm(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease-out;
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: scaleIn 0.3s ease-out;
    `;

    dialog.innerHTML = `
        <div style="display: flex; align-items: start; gap: 16px; margin-bottom: 24px;">
            <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #fef3c7;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            ">⚠️</div>
            <div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937;">Xác nhận</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${message}</p>
            </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelBtn" style="
                padding: 10px 20px;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">Hủy</button>
            <button id="confirmBtn" style="
                padding: 10px 20px;
                border: none;
                background: #ef4444;
                color: white;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">Xác nhận</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    if (!document.getElementById("confirmAnimations")) {
        style.id = "confirmAnimations";
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            #cancelBtn:hover {
                background: #f3f4f6 !important;
            }
            #confirmBtn:hover {
                background: #dc2626 !important;
            }
        `;
        document.head.appendChild(style);
    }

    const closeDialog = () => {
        overlay.style.animation = "fadeOut 0.2s ease-in";
        setTimeout(() => overlay.remove(), 200);
    };

    dialog.querySelector("#cancelBtn").onclick = closeDialog;
    dialog.querySelector("#confirmBtn").onclick = () => {
        closeDialog();
        if (onConfirm) onConfirm();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) closeDialog();
    };
}

// Check và restore view khi load trang
async function checkAndRestoreView() {
    const detailView = sessionStorage.getItem("studentDetailView");
    if (detailView) {
        try {
            const { studentId, timestamp } = JSON.parse(detailView);
            // Chỉ restore nếu trong vòng 5 phút (để tránh restore khi đã quá lâu)
            if (Date.now() - timestamp < 5 * 60 * 1000) {
                await viewStudentDetail(studentId);
                return true; // Đã restore detail view
            } else {
                sessionStorage.removeItem("studentDetailView");
            }
        } catch (e) {
            console.error("Error restoring detail view:", e);
            sessionStorage.removeItem("studentDetailView");
        }
    }
    return false; // Không có detail view để restore
}

// Load giao diện danh sách sinh viên
async function loadStudentManagement() {
    document.body.innerHTML = `
        <div class="admin-container">
            <header class="header">
                <div class="header-left">
                    <h1>Quản Lý Sinh Viên</h1>
                    <span class="user-info">Xin chào, ${
                        sessionStorage.getItem("fullName") ||
                        sessionStorage.getItem("username")
                    }</span>
                </div>
                <div class="header-right">
                    <button onclick="logout()" class="logout-btn">Đăng xuất</button>
                </div>
            </header>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <button onclick="showAddStudentForm()" class="btn btn-primary">
                        <i class="icon">+</i> Thêm sinh viên
                    </button>
                    <button onclick="refreshData()" class="btn btn-secondary">
                        <i class="icon">↻</i> Làm mới
                    </button>
                    <button onclick="showImportDialog()" class="btn btn-info">
                        <i class="icon">📥</i> Nhập Excel
                    </button>
                    <button onclick="exportToExcel()" class="btn btn-success">
                        <i class="icon">📤</i> Xuất Excel
                    </button>
                </div>
                
                <div class="toolbar-right">
                    <div class="search-box">
                        <input type="text" id="searchInput" placeholder="🔍 Tìm kiếm theo mã hoặc tên..." onkeyup="searchStudents()">
                    </div>
                    <button onclick="toggleFilterPanel()" class="btn btn-filter" id="filterToggleBtn">
                        <i class="icon">🎯</i> Bộ lọc <span id="filterCount" style="display: none; background: #ef4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 11px; margin-left: 4px;"></span>
                    </button>
                </div>
            </div>
            
            <!-- Filter Panel -->
            <div id="filterPanel" class="filter-panel" style="display: none;">
                <div class="filter-panel-content">
                    <div class="filter-panel-header">
                        <h3>🎯 Bộ lọc và sắp xếp</h3>
                    </div>
                    <div class="filter-panel-body">
                        <div class="filter-group">
                            <label>🎓 Khoa</label>
                            <select id="facultyFilter" onchange="filterStudents()">
                                <option value="">Tất cả khoa</option>
                                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                                <option value="Khoa học máy tính">Khoa học máy tính</option>
                                <option value="Kiến trúc xây dựng">Kiến trúc xây dựng</option>
                                <option value="Kinh tế">Kinh tế</option>
                                <option value="Y học">Y học</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>👤 Giới tính</label>
                            <select id="genderFilter" onchange="filterStudents()">
                                <option value="">Tất cả giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>📋 Trạng thái</label>
                            <select id="statusFilter" onchange="filterStudents()">
                                <option value="">Tất cả trạng thái</option>
                                <option value="Đang học">Đang học</option>
                                <option value="Bảo lưu">Bảo lưu</option>
                                <option value="Thôi học">Thôi học</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>📊 Sắp xếp theo</label>
                            <select id="sortFilter" onchange="filterStudents()">
                                <option value="created_at-DESC">🕐 Mới nhất</option>
                                <option value="created_at-ASC">🕐 Cũ nhất</option>
                                <option value="student_id-ASC">🔢 Mã SV (Tăng dần)</option>
                                <option value="student_id-DESC">🔢 Mã SV (Giảm dần)</option>
                                <option value="full_name-ASC">📝 Tên (A-Z)</option>
                                <option value="full_name-DESC">📝 Tên (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content">
                <div class="table-container">
                    <div id="loadingMessage" style="text-align: center; padding: 2rem;">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                    <table id="studentTable" style="display: none;">
                        <thead>
                            <tr>
                                <th>Mã SV</th>
                                <th>Họ tên</th>
                                <th>Giới tính</th>
                                <th>Lớp</th>
                                <th>Khoa</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination-container" id="paginationContainer" style="display: none;">
                    <div class="pagination-info">
                        <span id="pageInfo"></span>
                        <select id="itemsPerPage" onchange="changeItemsPerPage()" style="margin-left: 0.5rem; padding: 0.3rem 0.5rem; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span style="margin-left: 0.3rem; font-size: 0.85rem; color: #6b7280;">/ trang</span>
                    </div>
                    <div class="pagination" id="pagination">
                    </div>
                </div>
            </div>
        </div>
        
        ${getStyles()}
    `;

    // Load data từ API
    await loadStudentsFromAPI();
}

// Load danh sách sinh viên từ API
async function loadStudentsFromAPI() {
    try {
        const sortValue =
            document.getElementById("sortFilter")?.value || "created_at-DESC";
        const [sortBy, order] = sortValue.split("-");

        const response = await apiService.getStudents({
            page: currentPage,
            limit: studentsPerPage,
            search: document.getElementById("searchInput")?.value || "",
            department: document.getElementById("facultyFilter")?.value || "",
            gender: document.getElementById("genderFilter")?.value || "",
            status: document.getElementById("statusFilter")?.value || "",
            sortBy: sortBy || "created_at",
            order: order || "DESC",
        });

        if (response.success) {
            students = response.data || [];

            if (response.pagination) {
                totalStudents = response.pagination.total;
            }

            document.getElementById("loadingMessage").style.display = "none";
            document.getElementById("studentTable").style.display = "table";
            document.getElementById("paginationContainer").style.display =
                "flex";

            displayStudents();

            if (response.pagination) {
                renderPagination(response.pagination);
            }
        }
    } catch (error) {
        console.error("Load students error:", error);
        document.getElementById("loadingMessage").innerHTML =
            '<p style="color: red;">Lỗi tải dữ liệu. Vui lòng kiểm tra kết nối server.</p>';
    }
}

// Hiển thị danh sách sinh viên (CHỈ hiển thị: Mã SV, Họ tên, Giới tính, Lớp, Khoa, Trạng thái)
function displayStudents() {
    const tableBody = document.getElementById("studentTableBody");
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Không có dữ liệu sinh viên</td></tr>';
        return;
    }

    students.forEach((student) => {
        const row = document.createElement("tr");

        // Badge màu cho trạng thái
        let statusBadge = "";
        if (student.status === "Đang học") {
            statusBadge =
                '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Đang học</span>';
        } else if (student.status === "Bảo lưu") {
            statusBadge =
                '<span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Bảo lưu</span>';
        } else if (student.status === "Thôi học") {
            statusBadge =
                '<span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Thôi học</span>';
        }

        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.full_name}</td>
            <td>${student.gender}</td>
            <td>${student.class}</td>
            <td>${student.department}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="viewStudentDetail(${student.id})" class="btn btn-info" style="padding: 0.4rem 1rem; font-size: 0.85rem;">👁️ Xem chi tiết</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePageInfo();
}

// Xem chi tiết sinh viên
async function viewStudentDetail(studentId) {
    try {
        // Lưu filter state trước khi chuyển trang
        saveFilterState();

        const response = await apiService.getStudentById(studentId);

        if (response.success) {
            currentStudentDetail = response.data;
            // Lưu flag để biết đang ở trang chi tiết
            sessionStorage.setItem(
                "studentDetailView",
                JSON.stringify({
                    studentId: studentId,
                    timestamp: Date.now(),
                })
            );
            showStudentDetailPage(currentStudentDetail);
        }
    } catch (error) {
        showToast("Lỗi tải thông tin sinh viên: " + error.message, "error");
    }
}

// Hiển thị trang chi tiết sinh viên
function showStudentDetailPage(student) {
    // Badge màu cho trạng thái
    let statusBadge = "";
    if (student.status === "Đang học") {
        statusBadge =
            '<span style="background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">✓ Đang học</span>';
    } else if (student.status === "Bảo lưu") {
        statusBadge =
            '<span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">⏸ Bảo lưu</span>';
    } else if (student.status === "Thôi học") {
        statusBadge =
            '<span style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">✕ Thôi học</span>';
    }

    document.body.innerHTML = `
        <div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;"></div>
        
        <div class="admin-container">
            <header class="header">
                <div class="header-left">
                    <h1>Chi Tiết Sinh Viên</h1>
                    <span class="user-info">Mã SV: ${student.student_id}</span>
                </div>
                <div class="header-right">
                    <button onclick="backToList()" class="btn btn-secondary">← Quay lại danh sách</button>
                </div>
            </header>
            
            <div class="content detail-content">
                <div class="detail-card">
                    <div class="detail-header">
                        <h2>${student.full_name}</h2>
                        <div>${statusBadge}</div>
                    </div>
                    
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Mã sinh viên:</label>
                            <span>${student.student_id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Họ và tên:</label>
                            <span>${student.full_name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Giới tính:</label>
                            <span>${student.gender}</span>
                        </div>
                        <div class="detail-item">
                            <label>Ngày sinh:</label>
                            <span>${student.date_of_birth}</span>
                        </div>
                        <div class="detail-item">
                            <label>Lớp:</label>
                            <span>${student.class}</span>
                        </div>
                        <div class="detail-item">
                            <label>Khoa:</label>
                            <span>${student.department}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${student.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>Số điện thoại:</label>
                            <span>${student.phone}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Địa chỉ:</label>
                            <span>${student.address}</span>
                        </div>
                    </div>
                    
                    <div class="detail-actions">
                        <button onclick="showEditStudentInfo(${
                            student.id
                        })" class="btn btn-warning">
                            ✏️ Cập nhật thông tin
                        </button>
                        <button onclick="showUpdateStatus(${
                            student.id
                        })" class="btn btn-primary">
                            🔄 Cập nhật trạng thái
                        </button>
                        <button onclick="deleteStudentFromDetail(${
                            student.id
                        })" class="btn btn-danger">
                            🗑️ Xóa sinh viên
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        ${getStyles()}
        ${getDetailStyles()}
    `;
}

// Lưu trạng thái filter vào sessionStorage
function saveFilterState() {
    const filterState = {
        search: document.getElementById("searchInput")?.value || "",
        faculty: document.getElementById("facultyFilter")?.value || "",
        gender: document.getElementById("genderFilter")?.value || "",
        status: document.getElementById("statusFilter")?.value || "",
        sort: document.getElementById("sortFilter")?.value || "created_at-DESC",
        page: currentPage,
        itemsPerPage: studentsPerPage,
    };
    sessionStorage.setItem("studentFilterState", JSON.stringify(filterState));
}

// Restore trạng thái filter từ sessionStorage
function restoreFilterState() {
    const savedState = sessionStorage.getItem("studentFilterState");
    if (savedState) {
        try {
            const filterState = JSON.parse(savedState);

            // Restore các giá trị filter
            if (document.getElementById("searchInput")) {
                document.getElementById("searchInput").value =
                    filterState.search || "";
            }
            if (document.getElementById("facultyFilter")) {
                document.getElementById("facultyFilter").value =
                    filterState.faculty || "";
            }
            if (document.getElementById("genderFilter")) {
                document.getElementById("genderFilter").value =
                    filterState.gender || "";
            }
            if (document.getElementById("statusFilter")) {
                document.getElementById("statusFilter").value =
                    filterState.status || "";
            }
            if (document.getElementById("sortFilter")) {
                document.getElementById("sortFilter").value =
                    filterState.sort || "created_at-DESC";
            }

            // Restore pagination
            currentPage = filterState.page || 1;
            studentsPerPage = filterState.itemsPerPage || 10;
            if (document.getElementById("itemsPerPage")) {
                document.getElementById("itemsPerPage").value = studentsPerPage;
            }

            // Update filter count badge
            updateFilterCount();
        } catch (e) {
            console.error("Error restoring filter state:", e);
        }
    }
}

// Quay lại danh sách
async function backToList() {
    sessionStorage.removeItem("studentDetailView"); // Clear detail view flag
    await loadStudentManagement();
    restoreFilterState(); // Restore filter sau khi load xong
    await loadStudentsFromAPI(); // Load lại data với filter đã restore
}

// Hiển thị form cập nhật thông tin (KHÔNG bao gồm trạng thái)
async function showEditStudentInfo(studentId) {
    try {
        const response = await apiService.getStudentById(studentId);

        if (response.success) {
            const student = response.data;

            // Convert date from DD/MM/YYYY to YYYY-MM-DD
            const dateStr = student.date_of_birth;
            let formattedDate;
            if (dateStr.includes("/")) {
                const [day, month, year] = dateStr.split("/");
                formattedDate = `${year}-${month.padStart(
                    2,
                    "0"
                )}-${day.padStart(2, "0")}`;
            } else if (dateStr.includes("T")) {
                formattedDate = dateStr.split("T")[0];
            } else {
                formattedDate = dateStr;
            }

            showEditInfoModal(student, formattedDate);
        }
    } catch (error) {
        showToast("Lỗi tải thông tin sinh viên: " + error.message, "error");
    }
}

// Modal cập nhật thông tin (không có trạng thái)
function showEditInfoModal(student, formattedDate) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "editInfoModal";
    modal.style.display = "block";

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cập nhật thông tin sinh viên</h3>
                <span class="close" onclick="closeEditInfoModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editInfoForm" onsubmit="saveStudentInfo(event, ${
                    student.id
                })">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentId">Mã sinh viên *</label>
                            <input type="text" id="studentId" value="${
                                student.student_id
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="studentName">Họ tên *</label>
                            <input type="text" id="studentName" value="${
                                student.full_name
                            }" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentGender">Giới tính *</label>
                            <select id="studentGender" required>
                                <option value="Nam" ${
                                    student.gender === "Nam" ? "selected" : ""
                                }>Nam</option>
                                <option value="Nữ" ${
                                    student.gender === "Nữ" ? "selected" : ""
                                }>Nữ</option>
                                <option value="Khác" ${
                                    student.gender === "Khác" ? "selected" : ""
                                }>Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="studentDob">Ngày sinh *</label>
                            <input type="date" id="studentDob" value="${formattedDate}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentClass">Lớp *</label>
                            <input type="text" id="studentClass" value="${
                                student.class
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="studentFaculty">Khoa *</label>
                            <select id="studentFaculty" required>
                                <option value="Công nghệ thông tin" ${
                                    student.department === "Công nghệ thông tin"
                                        ? "selected"
                                        : ""
                                }>Công nghệ thông tin</option>
                                <option value="Hệ thống thông tin" ${
                                    student.department === "Hệ thống thông tin"
                                        ? "selected"
                                        : ""
                                }>Hệ thống thông tin</option>
                                <option value="Khoa học máy tính" ${
                                    student.department === "Khoa học máy tính"
                                        ? "selected"
                                        : ""
                                }>Khoa học máy tính</option>
                                <option value="Kiến trúc xây dựng" ${
                                    student.department === "Kiến trúc xây dựng"
                                        ? "selected"
                                        : ""
                                }>Kiến trúc xây dựng</option>
                                <option value="Kinh tế" ${
                                    student.department === "Kinh tế"
                                        ? "selected"
                                        : ""
                                }>Kinh tế</option>
                                <option value="Y học" ${
                                    student.department === "Y học"
                                        ? "selected"
                                        : ""
                                }>Y học</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentEmail">Email *</label>
                            <input type="email" id="studentEmail" value="${
                                student.email
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="studentPhone">Số điện thoại *</label>
                            <input type="tel" id="studentPhone" value="${
                                student.phone
                            }" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="studentAddress">Địa chỉ *</label>
                        <textarea id="studentAddress" rows="3" required>${
                            student.address
                        }</textarea>
                    </div>
                    
                    <p style="font-size: 13px; color: #6b7280; font-style: italic; margin-top: 16px;">
                        💡 Lưu ý: Trạng thái học tập không được cập nhật ở đây. Sử dụng nút "Cập nhật trạng thái" để thay đổi trạng thái.
                    </p>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeEditInfoModal()" class="btn btn-secondary">Hủy</button>
                        <button type="submit" class="btn btn-primary">💾 Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeEditInfoModal() {
    const modal = document.getElementById("editInfoModal");
    if (modal) {
        modal.remove();
    }
}

// Lưu thông tin sinh viên (không update trạng thái)
async function saveStudentInfo(event, studentId) {
    event.preventDefault();

    const studentData = {
        studentId: document.getElementById("studentId").value.trim(),
        fullName: document.getElementById("studentName").value.trim(),
        gender: document.getElementById("studentGender").value,
        dateOfBirth: document.getElementById("studentDob").value,
        class: document.getElementById("studentClass").value.trim(),
        department: document.getElementById("studentFaculty").value,
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        address: document.getElementById("studentAddress").value.trim(),
    };

    // Validation
    if (
        !studentData.studentId ||
        !studentData.fullName ||
        !studentData.gender ||
        !studentData.dateOfBirth ||
        !studentData.class ||
        !studentData.department ||
        !studentData.email ||
        !studentData.phone ||
        !studentData.address
    ) {
        showToast("Vui lòng điền đầy đủ thông tin", "error");
        return;
    }

    // Validate mã sinh viên
    if (!/^111809\d{4}$/.test(studentData.studentId)) {
        showToast("Mã sinh viên phải có định dạng 111809XXXX", "error");
        return;
    }

    // Validate họ tên - phải có ít nhất 2 từ
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(studentData.fullName)) {
        showToast("Họ tên chỉ được chứa chữ cái và khoảng trắng", "error");
        return;
    }

    if (studentData.fullName.trim().split(/\s+/).length < 2) {
        showToast("Họ tên phải có ít nhất 2 từ (ví dụ: Nguyễn Văn)", "error");
        return;
    }

    if (studentData.fullName.length < 5) {
        showToast("Họ tên quá ngắn (tối thiểu 5 ký tự)", "error");
        return;
    }

    // Validate email format và domain
    if (
        !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            studentData.email
        )
    ) {
        showToast("Email không hợp lệ", "error");
        return;
    }

    const domain = studentData.email.split("@")[1]?.toLowerCase();
    const validDomains = [
        "gmail.com",
        "yahoo.com",
        "yahoo.com.vn",
        "hotmail.com",
        "outlook.com",
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
    const isValidDomain = validDomains.some(
        (validDomain) =>
            domain === validDomain || domain?.endsWith("." + validDomain)
    );

    if (!isValidDomain) {
        showToast(
            "Email phải thuộc domain: gmail.com, yahoo.com, hotmail.com, outlook.com, ulsa.edu.vn hoặc ulsa.edu.com",
            "error"
        );
        return;
    }

    // Validate phone
    if (!/^0\d{9,10}$/.test(studentData.phone)) {
        showToast(
            "Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0",
            "error"
        );
        return;
    }

    try {
        const response = await apiService.updateStudent(studentId, studentData);

        if (response.success) {
            closeEditInfoModal();
            // Reload chi tiết
            await viewStudentDetail(studentId);
            // Hiển thị toast SAU KHI đã reload xong
            setTimeout(() => {
                showToast("Cập nhật thông tin thành công!", "success");
            }, 100);
        }
    } catch (error) {
        showToast("Lỗi: " + error.message, "error");
    }
}

// Hiển thị dialog cập nhật trạng thái
function showUpdateStatus(studentId) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "updateStatusModal";
    modal.style.display = "block";

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Cập nhật trạng thái học tập</h3>
                <span class="close" onclick="closeUpdateStatusModal()">&times;</span>
            </div>
            <div class="modal-body">
                <p style="color: #6b7280; margin-bottom: 20px;">Chọn trạng thái mới cho sinh viên:</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label style="
                        display: flex;
                        align-items: center;
                        padding: 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#10b981'" onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='#e5e7eb'">
                        <input type="radio" name="status" value="Đang học" style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <div style="font-weight: 600; color: #10b981; font-size: 15px;">✓ Đang học</div>
                            <div style="font-size: 13px; color: #6b7280;">Sinh viên đang theo học bình thường</div>
                        </div>
                    </label>
                    
                    <label style="
                        display: flex;
                        align-items: center;
                        padding: 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#f59e0b'" onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='#e5e7eb'">
                        <input type="radio" name="status" value="Bảo lưu" style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <div style="font-weight: 600; color: #f59e0b; font-size: 15px;">⏸ Bảo lưu</div>
                            <div style="font-size: 13px; color: #6b7280;">Sinh viên tạm thời nghỉ học có lý do</div>
                        </div>
                    </label>
                    
                    <label style="
                        display: flex;
                        align-items: center;
                        padding: 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#ef4444'" onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='#e5e7eb'">
                        <input type="radio" name="status" value="Thôi học" style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <div style="font-weight: 600; color: #ef4444; font-size: 15px;">✕ Thôi học</div>
                            <div style="font-size: 13px; color: #6b7280;">Sinh viên đã ngừng theo học</div>
                        </div>
                    </label>
                </div>
                
                <div class="form-actions" style="margin-top: 24px;">
                    <button type="button" onclick="closeUpdateStatusModal()" class="btn btn-secondary">Hủy</button>
                    <button type="button" onclick="saveStudentStatus(${studentId})" class="btn btn-primary">💾 Cập nhật trạng thái</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeUpdateStatusModal() {
    const modal = document.getElementById("updateStatusModal");
    if (modal) {
        modal.remove();
    }
}

// Lưu trạng thái mới
async function saveStudentStatus(studentId) {
    const selected = document.querySelector('input[name="status"]:checked');

    if (!selected) {
        showToast("Vui lòng chọn trạng thái", "error");
        return;
    }

    const newStatus = selected.value;

    try {
        const response = await apiService.updateStudentStatus(
            studentId,
            newStatus
        );

        if (response.success) {
            closeUpdateStatusModal();
            // Reload chi tiết
            await viewStudentDetail(studentId);
            // Hiển thị toast SAU KHI đã reload xong
            setTimeout(() => {
                showToast(
                    `Đã cập nhật trạng thái thành: ${newStatus}`,
                    "success"
                );
            }, 100);
        }
    } catch (error) {
        showToast("Lỗi: " + error.message, "error");
    }
}

// Xóa sinh viên từ trang chi tiết
function deleteStudentFromDetail(studentId) {
    showConfirm(
        "Bạn có chắc muốn xóa sinh viên này? Hành động này không thể hoàn tác.",
        async () => {
            try {
                const response = await apiService.deleteStudent(studentId);

                if (response.success) {
                    // Quay lại danh sách
                    await backToList();
                    // Hiển thị toast SAU KHI đã quay về danh sách
                    setTimeout(() => {
                        showToast("Xóa sinh viên thành công!", "success");
                    }, 100);
                }
            } catch (error) {
                showToast("Lỗi xóa sinh viên: " + error.message, "error");
            }
        }
    );
}

// Các hàm utility
function updatePageInfo() {
    const total = students.length;
    document.getElementById("pageInfo").textContent = `${total} sinh viên`;
}

function renderPagination(pagination) {
    const paginationDiv = document.getElementById("pagination");
    const { page, totalPages, total } = pagination;

    const startIndex = (page - 1) * studentsPerPage + 1;
    const endIndex = Math.min(page * studentsPerPage, total);
    document.getElementById(
        "pageInfo"
    ).textContent = `${startIndex}-${endIndex} / ${total} sinh viên`;

    if (totalPages <= 1) {
        paginationDiv.innerHTML = "";
        return;
    }

    const isMobile = window.innerWidth <= 768;
    let html = "";

    html += `<button class="btn btn-secondary" onclick="changePage(1)" ${
        page === 1 ? "disabled" : ""
    }>&laquo;</button>`;
    html += `<button class="btn btn-secondary" onclick="changePage(${
        page - 1
    })" ${page === 1 ? "disabled" : ""}>‹</button>`;

    if (isMobile) {
        // Mobile: Chỉ hiển thị trang hiện tại và text
        html += `<span class="page-info-text" style="padding: 0.5rem 1rem; font-weight: 600; color: #667eea; white-space: nowrap;">Trang ${page}/${totalPages}</span>`;
    } else {
        // Desktop: Hiển thị tất cả các trang
        for (let i = 1; i <= totalPages; i++) {
            if (i === page) {
                html += `<button class="btn btn-primary">${i}</button>`;
            } else {
                html += `<button class="btn btn-secondary" onclick="changePage(${i})">${i}</button>`;
            }
        }
    }

    html += `<button class="btn btn-secondary" onclick="changePage(${
        page + 1
    })" ${page === totalPages ? "disabled" : ""}>›</button>`;
    html += `<button class="btn btn-secondary" onclick="changePage(${totalPages})" ${
        page === totalPages ? "disabled" : ""
    }>&raquo;</button>`;

    paginationDiv.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadStudentsFromAPI();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeItemsPerPage() {
    const select = document.getElementById("itemsPerPage");
    studentsPerPage = parseInt(select.value);
    currentPage = 1;
    loadStudentsFromAPI();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function searchStudents() {
    currentPage = 1;
    saveFilterState(); // Lưu search state
    await loadStudentsFromAPI();
}

async function filterStudents() {
    currentPage = 1;
    updateFilterCount();
    saveFilterState(); // Lưu filter state
    await loadStudentsFromAPI();

    const faculty = document.getElementById("facultyFilter").value;
    const gender = document.getElementById("genderFilter").value;
    const status = document.getElementById("statusFilter").value;
    const sort = document.getElementById("sortFilter").value;

    if (faculty || gender || status) {
        let filterMsg = `Đã lọc: ${totalStudents} sinh viên`;
        const filters = [];
        if (faculty) filters.push(`Khoa: ${faculty}`);
        if (gender) filters.push(`Giới tính: ${gender}`);
        if (status) filters.push(`Trạng thái: ${status}`);
        if (filters.length > 0) {
            filterMsg += ` (${filters.join(", ")})`;
        }
        showToast(filterMsg, "info");
    }
}

// Toggle filter panel
function toggleFilterPanel() {
    const panel = document.getElementById("filterPanel");
    const btn = document.getElementById("filterToggleBtn");

    if (panel.style.display === "none") {
        panel.style.display = "block";
        btn.style.background = "#3b82f6";
        btn.style.color = "white";
    } else {
        panel.style.display = "none";
        btn.style.background = "";
        btn.style.color = "";
    }
}

// Update filter count badge
function updateFilterCount() {
    const faculty = document.getElementById("facultyFilter").value;
    const gender = document.getElementById("genderFilter").value;
    const status = document.getElementById("statusFilter").value;

    let count = 0;
    if (faculty) count++;
    if (gender) count++;
    if (status) count++;

    const badge = document.getElementById("filterCount");
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

async function refreshData() {
    document.getElementById("searchInput").value = "";
    document.getElementById("facultyFilter").value = "";
    document.getElementById("genderFilter").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("sortFilter").value = "created_at-DESC";
    currentPage = 1;

    updateFilterCount();
    await loadStudentsFromAPI();
    showToast("Đã làm mới dữ liệu!", "success");
} // Hiển thị form thêm sinh viên
function showAddStudentForm() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "addStudentModal";
    modal.style.display = "block";

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Thêm sinh viên mới</h3>
                <span class="close" onclick="closeAddStudentModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addStudentForm" onsubmit="saveNewStudent(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newStudentId">Mã sinh viên *</label>
                            <input type="text" id="newStudentId" placeholder="111809XXXX">
                            <div class="error-message" id="errorNewStudentId"></div>
                        </div>
                        <div class="form-group">
                            <label for="newStudentName">Họ tên *</label>
                            <input type="text" id="newStudentName" placeholder="Nguyễn Văn A">
                            <div class="error-message" id="errorNewStudentName"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newStudentGender">Giới tính *</label>
                            <select id="newStudentGender">
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                            <div class="error-message" id="errorNewStudentGender"></div>
                        </div>
                        <div class="form-group">
                            <label for="newStudentDob">Ngày sinh *</label>
                            <input type="date" id="newStudentDob">
                            <div class="error-message" id="errorNewStudentDob"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newStudentClass">Lớp *</label>
                            <input type="text" id="newStudentClass" placeholder="DHKTPM15A">
                            <div class="error-message" id="errorNewStudentClass"></div>
                        </div>
                        <div class="form-group">
                            <label for="newStudentFaculty">Khoa *</label>
                            <select id="newStudentFaculty">
                                <option value="">Chọn khoa</option>
                                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                                <option value="Khoa học máy tính">Khoa học máy tính</option>
                                <option value="Kiến trúc xây dựng">Kiến trúc xây dựng</option>
                                <option value="Kinh tế">Kinh tế</option>
                                <option value="Y học">Y học</option>
                            </select>
                            <div class="error-message" id="errorNewStudentFaculty"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newStudentEmail">Email *</label>
                            <input type="email" id="newStudentEmail" placeholder="example@gmail.com">
                            <div class="error-message" id="errorNewStudentEmail"></div>
                        </div>
                        <div class="form-group">
                            <label for="newStudentPhone">Số điện thoại *</label>
                            <input type="tel" id="newStudentPhone" placeholder="0901234567">
                            <div class="error-message" id="errorNewStudentPhone"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="newStudentAddress">Địa chỉ *</label>
                        <textarea id="newStudentAddress" rows="3" placeholder="123 Đường ABC, Quận X, TP.HCM"></textarea>
                        <div class="error-message" id="errorNewStudentAddress"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="newStudentStatus">Trạng thái học tập *</label>
                        <select id="newStudentStatus">
                            <option value="Đang học" selected>Đang học</option>
                            <option value="Bảo lưu">Bảo lưu</option>
                            <option value="Thôi học">Thôi học</option>
                        </select>
                        <div class="error-message" id="errorNewStudentStatus"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeAddStudentModal()" class="btn btn-secondary">Hủy</button>
                        <button type="submit" class="btn btn-primary">💾 Thêm sinh viên</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup real-time validation
    setupAddStudentValidation();
}

// Setup validation cho form thêm sinh viên
function setupAddStudentValidation() {
    const fields = [
        { id: "newStudentId", errorId: "errorNewStudentId" },
        { id: "newStudentName", errorId: "errorNewStudentName" },
        { id: "newStudentGender", errorId: "errorNewStudentGender" },
        { id: "newStudentDob", errorId: "errorNewStudentDob" },
        { id: "newStudentClass", errorId: "errorNewStudentClass" },
        { id: "newStudentFaculty", errorId: "errorNewStudentFaculty" },
        { id: "newStudentEmail", errorId: "errorNewStudentEmail" },
        { id: "newStudentPhone", errorId: "errorNewStudentPhone" },
        { id: "newStudentAddress", errorId: "errorNewStudentAddress" },
        { id: "newStudentStatus", errorId: "errorNewStudentStatus" },
    ];

    fields.forEach((field) => {
        const element = document.getElementById(field.id);
        if (element) {
            // Validate on blur
            element.addEventListener("blur", function () {
                validateAddStudentField(field.id, field.errorId);
            });

            // Clear error on input
            element.addEventListener("input", function () {
                const errorElement = document.getElementById(field.errorId);
                if (errorElement && errorElement.textContent) {
                    errorElement.textContent = "";
                    errorElement.style.display = "none";
                    element.classList.remove("error");
                }
            });
        }
    });
}

// Validate từng field trong form thêm sinh viên
function validateAddStudentField(fieldId, errorId) {
    const element = document.getElementById(fieldId);
    const value = element.value.trim();

    const showError = (message) => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
            element.classList.add("error");
        }
    };

    const clearError = () => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
            element.classList.remove("error");
        }
    };

    switch (fieldId) {
        case "newStudentId":
            if (!value) {
                showError("Vui lòng nhập mã sinh viên");
            } else if (!/^111809\d{4}$/.test(value)) {
                showError("Mã sinh viên phải có định dạng 111809XXXX");
            } else {
                clearError();
            }
            break;

        case "newStudentName":
            if (!value) {
                showError("Vui lòng nhập họ tên");
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
                showError("Họ tên chỉ được chứa chữ cái và khoảng trắng");
            } else if (value.trim().split(/\s+/).length < 2) {
                showError("Họ tên phải có ít nhất 2 từ (ví dụ: Nguyễn Văn)");
            } else if (value.length < 5) {
                showError("Họ tên quá ngắn (tối thiểu 5 ký tự)");
            } else {
                clearError();
            }
            break;

        case "newStudentGender":
            if (!value) {
                showError("Vui lòng chọn giới tính");
            } else {
                clearError();
            }
            break;

        case "newStudentDob":
            if (!value) {
                showError("Vui lòng chọn ngày sinh");
            } else {
                const birthDate = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                    age--;
                }

                if (age < 16) {
                    showError("Sinh viên phải từ 16 tuổi trở lên");
                } else if (age > 50) {
                    showError("Tuổi sinh viên không được quá 50");
                } else {
                    clearError();
                }
            }
            break;

        case "newStudentClass":
            if (!value) {
                showError("Vui lòng nhập lớp");
            } else if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
                showError("Lớp chỉ được chứa chữ, số và dấu gạch ngang");
            } else {
                clearError();
            }
            break;

        case "newStudentFaculty":
            if (!value) {
                showError("Vui lòng chọn khoa");
            } else {
                clearError();
            }
            break;

        case "newStudentEmail":
            if (!value) {
                showError("Vui lòng nhập email");
            } else if (
                !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            ) {
                showError("Email không hợp lệ");
            } else {
                const domain = value.split("@")[1]?.toLowerCase();
                const validDomains = [
                    "gmail.com",
                    "yahoo.com",
                    "hotmail.com",
                    "outlook.com",
                    "ulsa.edu.vn",
                    "student.ulsa.edu.vn",
                    "ulsa.edu.com",
                ];
                const isValidDomain = validDomains.some(
                    (validDomain) =>
                        domain === validDomain ||
                        domain?.endsWith("." + validDomain)
                );

                if (!isValidDomain) {
                    showError(
                        "Email phải thuộc domain: gmail.com, yahoo.com, hotmail.com, outlook.com, ulsa.edu.vn hoặc ulsa.edu.com"
                    );
                } else {
                    clearError();
                }
            }
            break;

        case "newStudentPhone":
            if (!value) {
                showError("Vui lòng nhập số điện thoại");
            } else if (!/^0\d{9,10}$/.test(value)) {
                showError("SĐT phải có 10-11 chữ số và bắt đầu bằng 0");
            } else {
                clearError();
            }
            break;

        case "newStudentAddress":
            if (!value) {
                showError("Vui lòng nhập địa chỉ");
            } else if (value.length < 5) {
                showError("Địa chỉ quá ngắn (tối thiểu 5 ký tự)");
            } else {
                clearError();
            }
            break;

        case "newStudentStatus":
            if (!value) {
                showError("Vui lòng chọn trạng thái");
            } else {
                clearError();
            }
            break;
    }
}
function closeAddStudentModal() {
    const modal = document.getElementById("addStudentModal");
    if (modal) {
        modal.remove();
    }
}

// Lưu sinh viên mới
async function saveNewStudent(event) {
    event.preventDefault();

    const studentData = {
        studentId: document.getElementById("newStudentId").value.trim(),
        fullName: document.getElementById("newStudentName").value.trim(),
        gender: document.getElementById("newStudentGender").value,
        dateOfBirth: document.getElementById("newStudentDob").value,
        class: document.getElementById("newStudentClass").value.trim(),
        department: document.getElementById("newStudentFaculty").value,
        email: document.getElementById("newStudentEmail").value.trim(),
        phone: document.getElementById("newStudentPhone").value.trim(),
        address: document.getElementById("newStudentAddress").value.trim(),
        status: document.getElementById("newStudentStatus").value,
    };

    // Validate TẤT CẢ các trường và hiển thị lỗi đỏ
    let hasErrors = false;

    // Validate từng trường
    const fields = [
        { id: "newStudentId", errorId: "errorNewStudentId" },
        { id: "newStudentName", errorId: "errorNewStudentName" },
        { id: "newStudentGender", errorId: "errorNewStudentGender" },
        { id: "newStudentDob", errorId: "errorNewStudentDob" },
        { id: "newStudentClass", errorId: "errorNewStudentClass" },
        { id: "newStudentFaculty", errorId: "errorNewStudentFaculty" },
        { id: "newStudentEmail", errorId: "errorNewStudentEmail" },
        { id: "newStudentPhone", errorId: "errorNewStudentPhone" },
        { id: "newStudentAddress", errorId: "errorNewStudentAddress" },
        { id: "newStudentStatus", errorId: "errorNewStudentStatus" },
    ];

    fields.forEach((field) => {
        validateAddStudentField(field.id, field.errorId);
        const errorElement = document.getElementById(field.errorId);
        if (errorElement && errorElement.style.display === "block") {
            hasErrors = true;
        }
    });

    // Nếu có lỗi, dừng lại
    if (hasErrors) {
        showToast("Vui lòng kiểm tra và điền đầy đủ thông tin!", "error");
        return;
    }

    console.log("Data gửi lên server:", studentData);

    // Chuyển đổi sang snake_case cho backend
    const backendData = {
        student_id: studentData.studentId,
        full_name: studentData.fullName,
        gender: studentData.gender,
        date_of_birth: studentData.dateOfBirth,
        class: studentData.class,
        department: studentData.department,
        email: studentData.email,
        phone: studentData.phone,
        address: studentData.address,
        status: studentData.status,
    };

    console.log("Data chuyển đổi snake_case:", backendData);

    try {
        const response = await apiService.addStudent(backendData);

        console.log("Response từ server:", response);

        if (response.success) {
            showToast("Thêm sinh viên thành công!", "success");
            closeAddStudentModal();
            // Reload danh sách
            await loadStudentsFromAPI();
        }
    } catch (error) {
        console.error("Chi tiết lỗi:", error);
        showToast("Lỗi: " + error.message, "error");
    }
}

// Xuất Excel - Hiển thị dialog lựa chọn
function exportToExcel() {
    showExportDialog();
}

function showExportDialog() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "exportModal";
    modal.style.display = "block";

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h3>📤 Xuất dữ liệu ra Excel</h3>
                <span class="close" onclick="closeExportModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="background: #f0f9ff; padding: 16px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 15px; font-weight: 600;">📋 Tùy chọn xuất dữ liệu:</h4>
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">Chọn dữ liệu bạn muốn xuất ra file Excel (CSV)</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    <label style="
                        display: flex;
                        align-items: start;
                        padding: 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#f0f9ff'" onmouseout="if(!this.querySelector('input').checked) { this.style.borderColor='#e5e7eb'; this.style.background='white'; }">
                        <input type="radio" name="exportOption" value="all" checked onchange="toggleExportFilters()" style="margin-right: 12px; margin-top: 4px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">📊 Xuất tất cả sinh viên</div>
                            <div style="font-size: 13px; color: #6b7280;">Xuất toàn bộ ${totalStudents} sinh viên trong hệ thống</div>
                        </div>
                    </label>
                    
                    <label style="
                        display: flex;
                        align-items: start;
                        padding: 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#f0f9ff'" onmouseout="if(!this.querySelector('input').checked) { this.style.borderColor='#e5e7eb'; this.style.background='white'; }">
                        <input type="radio" name="exportOption" value="filtered" onchange="toggleExportFilters()" style="margin-right: 12px; margin-top: 4px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">🔍 Xuất theo bộ lọc</div>
                            <div style="font-size: 13px; color: #6b7280;">Tùy chỉnh điều kiện lọc để xuất dữ liệu</div>
                        </div>
                    </label>
                </div>

                <!-- Bộ lọc xuất hiện khi chọn "Xuất theo bộ lọc" -->
                <div id="exportFiltersContainer" style="display: none; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">⚙️ Điều kiện lọc:</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Khoa:</label>
                            <select id="exportFacultyFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">
                                <option value="">Tất cả khoa</option>
                                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                                <option value="Khoa học máy tính">Khoa học máy tính</option>
                                <option value="Kiến trúc xây dựng">Kiến trúc xây dựng</option>
                                <option value="Kinh tế">Kinh tế</option>
                                <option value="Y học">Y học</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Giới tính:</label>
                            <select id="exportGenderFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">
                                <option value="">Tất cả giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Trạng thái:</label>
                            <select id="exportStatusFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">
                                <option value="">Tất cả trạng thái</option>
                                <option value="Đang học">Đang học</option>
                                <option value="Bảo lưu">Bảo lưu</option>
                                <option value="Thôi học">Thôi học</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Tìm kiếm:</label>
                            <input type="text" id="exportSearchFilter" placeholder="Mã SV hoặc tên..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                    </div>
                </div>

                <div style="background: #fef3c7; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        💡 File sẽ được tải về dạng CSV với 10 cột thông tin đầy đủ
                    </p>
                </div>
            </div>
            <div class="form-actions" style="padding: 16px 24px; border-top: 2px solid #e5e7eb;">
                <button type="button" class="btn btn-secondary" onclick="closeExportModal()">Hủy</button>
                <button type="button" class="btn btn-success" onclick="confirmExport()">📤 Xuất Excel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function toggleExportFilters() {
    const selected = document.querySelector(
        'input[name="exportOption"]:checked'
    );
    const filtersContainer = document.getElementById("exportFiltersContainer");

    if (selected && selected.value === "filtered") {
        filtersContainer.style.display = "block";
    } else {
        filtersContainer.style.display = "none";
    }
}

function closeExportModal() {
    const modal = document.getElementById("exportModal");
    if (modal) {
        modal.remove();
    }
}

async function confirmExport() {
    const selected = document.querySelector(
        'input[name="exportOption"]:checked'
    );
    if (!selected) {
        showToast("Vui lòng chọn tùy chọn xuất!", "error");
        return;
    }

    const exportAll = selected.value === "all";

    try {
        const params = {
            page: 1,
            limit: 999999,
        };

        if (!exportAll) {
            // Xuất theo bộ lọc tùy chỉnh trong dialog
            params.search =
                document.getElementById("exportSearchFilter")?.value || "";
            params.department =
                document.getElementById("exportFacultyFilter")?.value || "";
            params.gender =
                document.getElementById("exportGenderFilter")?.value || "";
            params.status =
                document.getElementById("exportStatusFilter")?.value || "";
        }

        const response = await apiService.getStudents(params);

        if (!response.success || response.data.length === 0) {
            showToast("Không có dữ liệu để xuất!", "error");
            return;
        }

        const studentsToExport = response.data;

        // Tạo CSV
        const headers = [
            "Mã SV",
            "Họ tên",
            "Giới tính",
            "Ngày sinh",
            "Lớp",
            "Khoa",
            "Email",
            "Số điện thoại",
            "Địa chỉ",
            "Trạng thái",
        ];
        let csvContent = "\uFEFF" + headers.join(",") + "\n";

        studentsToExport.forEach((student) => {
            const row = [
                student.student_id,
                `"${student.full_name}"`,
                student.gender,
                formatDate(student.date_of_birth),
                student.class,
                `"${student.department}"`,
                student.email,
                student.phone,
                `"${student.address}"`,
                student.status || "Đang học",
            ];
            csvContent += row.join(",") + "\n";
        });

        // Download file
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `danh_sach_sinh_vien_${new Date().toISOString().slice(0, 10)}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        closeExportModal();
        showToast(
            `Đã xuất ${studentsToExport.length} sinh viên ra Excel!`,
            "success"
        );
    } catch (error) {
        console.error("Lỗi xuất Excel:", error);
        showToast("Có lỗi khi xuất Excel!", "error");
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
}

// Nhập Excel
function showImportDialog() {
    const dialog = document.createElement("div");
    dialog.className = "modal";
    dialog.id = "importModal";
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>📥 Nhập dữ liệu từ Excel</h3>
                <span class="close" onclick="closeImportModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="background: #f0f9ff; padding: 16px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 15px; font-weight: 600;">
                        📋 Định dạng file CSV yêu cầu:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                        <li>File CSV với mã hóa UTF-8</li>
                        <li>Dòng đầu tiên là tiêu đề (sẽ bị bỏ qua)</li>
                        <li>10 cột: Mã SV, Họ tên, Giới tính, Ngày sinh, Lớp, Khoa, Email, SĐT, Địa chỉ, Trạng thái</li>
                        <li>Mã SV: 111809XXXX (10 số)</li>
                        <li>Giới tính: Nam, Nữ hoặc Khác</li>
                        <li>Ngày sinh: DD/MM/YYYY (VD: 15/05/2002)</li>
                        <li>Email: Gmail, Yahoo, Outlook, Hotmail, iCloud hoặc .edu.vn</li>
                        <li>SĐT: 10-11 số, bắt đầu bằng 0</li>
                        <li>Trạng thái: Đang học, Bảo lưu hoặc Thôi học</li>
                    </ul>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 10px;">
                        📂 Chọn file CSV:
                    </label>
                    <input type="file" id="importFileInput" accept=".csv" style="display: block; width: 100%; padding: 12px; border: 2px dashed #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px;">
                </div>

                <div style="background: #fef3c7; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        💡 <strong>Tải file mẫu:</strong> 
                        <a href="#" onclick="downloadTemplate(); return false;" style="color: #d97706; text-decoration: underline; font-weight: 600;">
                            Nhấn vào đây
                        </a>
                    </p>
                </div>

                <div id="importPreview" style="margin-top: 20px; display: none;">
                    <h4 style="color: #374151; margin-bottom: 10px;">🔍 Xem trước:</h4>
                    <div id="importPreviewContent" style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb;">
                    </div>
                </div>
            </div>
            <div class="form-actions" style="padding: 16px 24px; border-top: 2px solid #e5e7eb;">
                <button type="button" class="btn btn-secondary" onclick="closeImportModal()">Hủy</button>
                <button type="button" class="btn btn-primary" id="confirmImportBtn" onclick="confirmImport()" disabled>📥 Nhập dữ liệu</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.style.display = "block";

    document
        .getElementById("importFileInput")
        .addEventListener("change", handleFileSelect);
}

function closeImportModal() {
    const modal = document.getElementById("importModal");
    if (modal) {
        modal.remove();
    }
}

let importData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
        showToast("Chỉ chấp nhận file CSV!", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const text = e.target.result;
            parseCSV(text);
        } catch (error) {
            showToast("Lỗi đọc file!", "error");
            console.error("File parse error:", error);
        }
    };
    reader.readAsText(file, "UTF-8");
}

function parseCSV(text) {
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
        showToast("File không có dữ liệu!", "error");
        return;
    }

    const dataLines = lines.slice(1);
    importData = [];
    const errors = [];

    dataLines.forEach((line, index) => {
        const values = parseCSVLine(line);

        if (values.length !== 10) {
            errors.push(
                `Dòng ${index + 2}: Thiếu cột (cần 10 cột, có ${
                    values.length
                } cột)`
            );
            return;
        }

        const [
            studentId,
            fullName,
            gender,
            dob,
            className,
            department,
            email,
            phone,
            address,
            status,
        ] = values;

        const rowErrors = [];
        if (!/^111809\d{4}$/.test(studentId))
            rowErrors.push("Mã SV không hợp lệ");
        if (!fullName || fullName.length < 2)
            rowErrors.push("Họ tên không hợp lệ");
        if (!["Nam", "Nữ", "Khác"].includes(gender))
            rowErrors.push("Giới tính không hợp lệ");
        if (!isValidDate(dob)) rowErrors.push("Ngày sinh không hợp lệ");
        if (!className) rowErrors.push("Lớp không được trống");
        if (!department) rowErrors.push("Khoa không được trống");
        if (!isValidEmail(email)) rowErrors.push("Email không hợp lệ");
        if (!isValidPhone(phone)) rowErrors.push("SĐT không hợp lệ");
        if (!address) rowErrors.push("Địa chỉ không được trống");
        if (!["Đang học", "Bảo lưu", "Thôi học"].includes(status))
            rowErrors.push("Trạng thái không hợp lệ");

        if (rowErrors.length > 0) {
            errors.push(
                `Dòng ${index + 2} (${studentId}): ${rowErrors.join(", ")}`
            );
        } else {
            importData.push({
                student_id: studentId,
                full_name: fullName,
                gender: gender,
                date_of_birth: convertDateFormat(dob),
                class: className,
                department: department,
                email: email,
                phone: phone,
                address: address,
                status: status,
            });
        }
    });

    showImportPreview(importData, errors);
}

function parseCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values.map((v) => v.replace(/^"|"$/g, "").trim());
}

function isValidDate(dateStr) {
    const regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^0\d{9,10}$/.test(phone);
}

function convertDateFormat(dateStr) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function showImportPreview(data, errors) {
    const previewDiv = document.getElementById("importPreview");
    const contentDiv = document.getElementById("importPreviewContent");
    const confirmBtn = document.getElementById("confirmImportBtn");

    previewDiv.style.display = "block";

    let html = "";

    if (errors.length > 0) {
        html += `<div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
            <h5 style="color: #b91c1c; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">❌ ${
                errors.length
            } lỗi:</h5>
            <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 13px;">
                ${errors
                    .slice(0, 10)
                    .map((err) => `<li>${err}</li>`)
                    .join("")}
                ${
                    errors.length > 10
                        ? `<li><em>... và ${
                              errors.length - 10
                          } lỗi khác</em></li>`
                        : ""
                }
            </ul>
        </div>`;
    }

    if (data.length > 0) {
        html += `<div style="background: #d1fae5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h5 style="color: #065f46; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">✅ ${
                data.length
            } bản ghi hợp lệ</h5>
            <div style="font-size: 13px; color: #047857;">
                <strong>Mẫu:</strong> ${data[0].student_id} - ${
            data[0].full_name
        } - ${data[0].status}
                ${
                    data.length > 1
                        ? `<br><strong>...</strong> và ${
                              data.length - 1
                          } sinh viên khác`
                        : ""
                }
            </div>
        </div>`;
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }

    contentDiv.innerHTML = html;
}

async function confirmImport() {
    if (importData.length === 0) {
        showToast("Không có dữ liệu hợp lệ!", "error");
        return;
    }

    const confirmBtn = document.getElementById("confirmImportBtn");
    confirmBtn.innerHTML = "⏳ Đang nhập...";
    confirmBtn.disabled = true;

    let successList = [];
    let failList = [];

    try {
        for (const student of importData) {
            try {
                const response = await apiService.addStudent(student);
                if (response.success) {
                    successList.push({
                        studentId: student.student_id,
                        fullName: student.full_name,
                        status: "success",
                    });
                } else {
                    failList.push({
                        studentId: student.student_id,
                        fullName: student.full_name,
                        error: response.message || "Lỗi không xác định",
                    });
                }
            } catch (error) {
                failList.push({
                    studentId: student.student_id,
                    fullName: student.full_name,
                    error: error.message || "Lỗi kết nối",
                });
            }
        }

        await loadStudentsFromAPI();
        closeImportModal();

        // Hiển thị modal kết quả thay vì toast
        showImportResultModal(successList, failList);
    } catch (error) {
        console.error("Import error:", error);
        showToast("Có lỗi xảy ra khi nhập dữ liệu!", "error");
        confirmBtn.innerHTML = "📥 Nhập dữ liệu";
        confirmBtn.disabled = false;
    }
}

// Modal hiển thị kết quả import
function showImportResultModal(successList, failList) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "importResultModal";
    modal.style.display = "block";

    const totalCount = successList.length + failList.length;
    const successCount = successList.length;
    const failCount = failList.length;

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>📊 Kết quả nhập dữ liệu</h3>
                <span class="close" onclick="closeImportResultModal()">&times;</span>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <!-- Tổng quan -->
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${
                    failCount > 0 ? "#f59e0b" : "#10b981"
                };">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #6b7280;">${totalCount}</div>
                            <div style="font-size: 13px; color: #6b7280;">Tổng số</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${successCount}</div>
                            <div style="font-size: 13px; color: #10b981;">Thành công</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${failCount}</div>
                            <div style="font-size: 13px; color: #ef4444;">Thất bại</div>
                        </div>
                    </div>
                </div>

                ${
                    successCount > 0
                        ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #10b981; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">✓</span> Nhập thành công (${successCount})
                    </h4>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; max-height: 200px; overflow-y: auto;">
                        ${successList
                            .map(
                                (item) => `
                            <div style="padding: 8px; border-bottom: 1px solid #dcfce7; display: flex; align-items: center; gap: 12px;">
                                <span style="color: #10b981; font-size: 16px;">✓</span>
                                <span style="font-weight: 600; color: #166534; min-width: 100px;">${item.studentId}</span>
                                <span style="color: #15803d;">${item.fullName}</span>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </div>
                `
                        : ""
                }

                ${
                    failCount > 0
                        ? `
                <div>
                    <h4 style="color: #ef4444; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">✕</span> Nhập thất bại (${failCount})
                    </h4>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto;">
                        ${failList
                            .map(
                                (item) => `
                            <div style="padding: 12px; border-bottom: 1px solid #fee2e2; margin-bottom: 8px; background: white; border-radius: 6px;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                                    <span style="color: #ef4444; font-size: 16px;">✕</span>
                                    <span style="font-weight: 600; color: #991b1b; min-width: 100px;">${item.studentId}</span>
                                    <span style="color: #b91c1c;">${item.fullName}</span>
                                </div>
                                <div style="padding-left: 28px; color: #dc2626; font-size: 13px; font-style: italic;">
                                    ❌ ${item.error}
                                </div>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </div>
                `
                        : ""
                }

                ${
                    failCount > 0
                        ? `
                <div style="background: #fef3c7; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        💡 <strong>Gợi ý:</strong> Kiểm tra lại dữ liệu của các sinh viên bị lỗi, sửa trong file Excel và thử nhập lại.
                    </p>
                </div>
                `
                        : ""
                }
            </div>
            <div class="form-actions" style="padding: 16px 24px; border-top: 2px solid #e5e7eb; background: white;">
                <button type="button" class="btn btn-primary" onclick="closeImportResultModal()">Đóng</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeImportResultModal() {
    const modal = document.getElementById("importResultModal");
    if (modal) {
        modal.remove();
    }
}

function downloadTemplate() {
    const headers = [
        "Mã SV",
        "Họ tên",
        "Giới tính",
        "Ngày sinh",
        "Lớp",
        "Khoa",
        "Email",
        "Số điện thoại",
        "Địa chỉ",
        "Trạng thái",
    ];
    const sampleData = [
        [
            "1118090001",
            "Nguyễn Văn A",
            "Nam",
            "15/05/2002",
            "DHKTPM15A",
            "Công nghệ thông tin",
            "nguyenvana@gmail.com",
            "0901234567",
            "123 Nguyễn Văn Bảo, Q. Gò Vấp, TP.HCM",
            "Đang học",
        ],
        [
            "1118090002",
            "Trần Thị B",
            "Nữ",
            "20/08/2003",
            "DHKTPM15B",
            "Hệ thống thông tin",
            "tranthib@yahoo.com",
            "0907654321",
            "456 Lê Văn Việt, Q.9, TP.HCM",
            "Đang học",
        ],
    ];

    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    sampleData.forEach((row) => {
        csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_nhap_sinh_vien.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Đã tải file mẫu!", "success");
}

async function logout() {
    showConfirm("Bạn có chắc muốn đăng xuất khỏi hệ thống?", async () => {
        try {
            await apiService.logout();
            sessionStorage.clear();
            location.reload();
        } catch (error) {
            console.error("Logout error:", error);
            sessionStorage.clear();
            location.reload();
        }
    });
}

// CSS Styles
function getStyles() {
    return `<style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        .admin-container { min-height: 100vh; display: flex; flex-direction: column; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { font-size: 1.8rem; margin-bottom: 0.2rem; }
        .user-info { font-size: 0.9rem; opacity: 0.9; }
        .logout-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; transition: all 0.3s; }
        .logout-btn:hover { background: rgba(255,255,255,0.3); }
        .toolbar { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 1rem; }
        .toolbar-left, .toolbar-right { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .btn { padding: 0.6rem 1.2rem; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s; display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a6fd8; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-secondary:hover { background: #5a6268; }
        .btn-secondary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #218838; }
        .btn-info { background: #17a2b8; color: white; }
        .btn-info:hover { background: #138496; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-warning:hover { background: #e0a800; }
        .btn-filter { background: white; color: #374151; border: 2px solid #e5e7eb; font-weight: 500; }
        .btn-filter:hover { background: #f3f4f6; border-color: #d1d5db; }
        .search-box input { padding: 0.6rem 0.6rem 0.6rem 0.8rem; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem; min-width: 280px; }
        .filter-panel { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin: 0 2rem 1rem 2rem; animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .filter-panel-content { padding: 1.5rem; }
        .filter-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb; }
        .filter-panel-header h3 { color: #1f2937; font-size: 1rem; font-weight: 600; }
        .btn-clear-filters { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
        .btn-clear-filters:hover { background: #fde68a; transform: translateY(-1px); }
        .filter-panel-body { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .filter-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .filter-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .filter-group select { padding: 0.6rem; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 0.9rem; color: #374151; background: white; cursor: pointer; transition: all 0.2s; }
        .filter-group select:hover { border-color: #d1d5db; }
        .filter-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .content { flex: 1; padding: 2rem; }
        .table-container { background: white; border-radius: 8px; overflow-x: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #495057; }
        tr:hover { background: #f8f9fa; }
        .pagination-container { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .pagination { display: flex; gap: 0.5rem; }
        .pagination .btn { min-width: 40px; padding: 0.5rem; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
        .modal-content { background-color: white; margin: 2% auto; padding: 0; border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .modal-content::-webkit-scrollbar { display: none; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { margin: 0; color: #333; }
        .close { font-size: 2rem; font-weight: bold; cursor: pointer; color: #999; }
        .close:hover { color: #333; }
        .modal-body { padding: 2rem; }
        .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .form-group { flex: 1; margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2); }
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; }
        .error-message { color: #dc3545; font-size: 0.8rem; margin-top: 0.3rem; min-height: 1rem; display: none; }
        .form-group input.error, .form-group select.error, .form-group textarea.error { border-color: #dc3545; background-color: #fff5f5; }
        
        /* Responsive Design - Tablet */
        @media (max-width: 1024px) {
            .header { padding: 0.8rem 1.5rem; }
            .header h1 { font-size: 1.5rem; }
            .toolbar { padding: 1rem 1.5rem; }
            .content { padding: 1.5rem; }
            .filter-panel { margin: 0 1.5rem 1rem 1.5rem; }
            .filter-panel-body { grid-template-columns: repeat(2, 1fr); }
            .modal-content { max-width: 700px; width: 85%; }
            .pagination-container { padding: 1rem 1.5rem; }
            th, td { padding: 0.8rem; font-size: 0.85rem; }
        }
        
        /* Responsive Design - Mobile */
        @media (max-width: 768px) {
            .header { flex-direction: row; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; }
            .header h1 { font-size: 1.2rem; margin-bottom: 0; }
            .user-info { display: none; }
            .logout-btn { width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; }
            
            .toolbar { flex-direction: column; padding: 0.8rem; gap: 0.8rem; }
            .toolbar-left, .toolbar-right { width: 100%; gap: 0.6rem; }
            .toolbar-left { display: grid; grid-template-columns: repeat(2, 1fr); }
            .toolbar-right { flex-direction: column; }
            
            .search-box { width: 100%; order: -1; }
            .search-box input { width: 100%; min-width: 0; padding: 0.7rem 1rem; font-size: 0.9rem; }
            
            .btn { padding: 0.7rem 1rem; font-size: 0.9rem; min-height: 44px; justify-content: center; white-space: nowrap; }
            .toolbar-left .btn { width: 100%; }
            .toolbar-right .btn { width: 100%; }
            
            .filter-panel { margin: 0 0.8rem 0.8rem 0.8rem; }
            .filter-panel-content { padding: 1rem; }
            .filter-panel-header { flex-direction: row; gap: 0.8rem; align-items: center; }
            .filter-panel-header h3 { font-size: 0.95rem; flex: 1; }
            .btn-clear-filters { width: auto; padding: 0.5rem 0.8rem; font-size: 0.85rem; }
            .filter-panel-body { grid-template-columns: 1fr; gap: 0.8rem; }
            .filter-group select { padding: 0.7rem; font-size: 0.9rem; min-height: 44px; }
            
            .content { padding: 0.8rem; }
            
            .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -0.8rem 1rem -0.8rem; border-radius: 0; }
            table { min-width: 700px; font-size: 0.85rem; }
            th, td { padding: 0.6rem 0.4rem; font-size: 0.82rem; white-space: nowrap; }
            th { font-size: 0.8rem; }
            th:first-child, td:first-child { position: sticky; left: 0; background: #f8f9fa; z-index: 2; box-shadow: 2px 0 4px rgba(0,0,0,0.05); }
            td:first-child { background: white; font-weight: 600; color: #667eea; }
            tr:hover td:first-child { background: #f8f9fa; }
            
            .pagination-container { flex-direction: column; gap: 0.8rem; padding: 0.8rem; margin: 0 -0.8rem; border-radius: 0; }
            .pagination-container > div:first-child { order: 2; text-align: center; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; }
            .pagination { flex-wrap: nowrap; justify-content: center; gap: 0.3rem; order: 1; }
            .pagination .btn { min-width: 38px; min-height: 38px; padding: 0.4rem; font-size: 0.85rem; flex-shrink: 0; }
            .pagination .page-info-text { font-size: 0.85rem; }
            .pagination-container select { padding: 0.3rem 0.4rem; font-size: 0.8rem; min-height: 32px; border-radius: 4px; max-width: 60px; }
            
            .modal-content { width: 95%; max-width: 95vw; margin: 5% auto; max-height: 85vh; }
            .modal-header { padding: 1rem; }
            .modal-header h3 { font-size: 1.1rem; }
            .modal-body { padding: 1rem; }
            .form-row { flex-direction: column; gap: 0; }
            .form-group { margin-bottom: 0.8rem; }
            .form-group label { font-size: 0.85rem; margin-bottom: 0.4rem; }
            .form-group input, .form-group select, .form-group textarea { padding: 0.7rem; font-size: 0.9rem; min-height: 44px; }
            .form-actions { flex-direction: column-reverse; gap: 0.6rem; padding: 1rem; margin-top: 1rem; }
            .form-actions .btn { width: 100%; }
            
            .detail-grid { grid-template-columns: 1fr; gap: 1rem; padding: 1rem; }
            .detail-item.full-width { grid-column: span 1; }
            .detail-item label { font-size: 0.75rem; }
            .detail-item span { font-size: 0.9rem; }
            .detail-header { padding: 1.2rem 1rem; flex-direction: column; gap: 0.8rem; align-items: flex-start; }
            .detail-header h2 { font-size: 1.2rem; margin: 0; word-break: break-word; width: 100%; }
            .detail-header > div { width: 100%; }
            .detail-header span { display: inline-block; width: auto; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .detail-actions { flex-direction: column; padding: 1rem; gap: 0.6rem; }
            .detail-actions .btn { width: 100%; }
            
            /* Export Dialog Mobile */
            #exportModal .modal-content { max-width: 95% !important; }
            #exportModal .modal-body > div[style*="grid"] { grid-template-columns: 1fr !important; }
            #exportModal label { padding: 12px !important; }
            #exportModal label > div:first-child { font-size: 0.9rem !important; }
            #exportModal label > div:last-child { font-size: 0.8rem !important; }
            #exportFiltersContainer > div[style*="grid"] { grid-template-columns: 1fr !important; gap: 0.8rem !important; }
            
            /* Import Result Modal Mobile */
            #importResultModal .modal-content { max-width: 95% !important; }
            #importResultModal div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; gap: 10px !important; }
            #importResultModal div[style*="font-size: 24px"] { font-size: 20px !important; }
            #importResultModal div[style*="font-size: 13px"] { font-size: 0.8rem !important; }
            #importResultModal div[style*="display: flex"] { flex-wrap: wrap; font-size: 0.85rem !important; }
            #importResultModal h4 { font-size: 0.95rem !important; }
        }
        
        /* Touch-friendly adjustments for all mobile devices */
        @media (max-width: 768px) and (pointer: coarse) {
            .btn { min-height: 44px; }
            .filter-group select { min-height: 44px; }
            .form-group input, .form-group select, .form-group textarea { min-height: 44px; }
            .pagination .btn { min-width: 40px; min-height: 40px; }
        }
        
        /* Small mobile phones */
        @media (max-width: 480px) {
            .header h1 { font-size: 1rem; }
            .logout-btn { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
            .modal-content { width: 98%; margin: 2% auto; }
            th, td { padding: 0.5rem 0.3rem; font-size: 0.75rem; }
            .btn { font-size: 0.85rem; padding: 0.6rem 0.8rem; }
            .filter-group label { font-size: 0.8rem; }
            .toolbar-left { grid-template-columns: 1fr; }
        }
    </style>`;
}

function getDetailStyles() {
    return `<style>
        .detail-content {
            max-width: 900px;
            margin: 2rem auto;
        }
        .detail-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .detail-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .detail-header h2 {
            margin: 0;
            font-size: 1.8rem;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            padding: 2rem;
        }
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .detail-item.full-width {
            grid-column: span 2;
        }
        .detail-item label {
            font-size: 0.85rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
        }
        .detail-item span {
            font-size: 1rem;
            color: #1f2937;
            font-weight: 500;
        }
        .detail-actions {
            display: flex;
            gap: 1rem;
            padding: 2rem;
            border-top: 1px solid #e5e7eb;
            justify-content: center;
        }
        @media (max-width: 768px) {
            .detail-content {
                max-width: 100%;
                margin: 0;
            }
            .detail-card {
                border-radius: 0;
                box-shadow: none;
            }
            .detail-grid {
                grid-template-columns: 1fr;
            }
            .detail-item.full-width {
                grid-column: span 1;
            }
            .detail-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.8rem;
                padding: 1.2rem 1rem;
            }
            .detail-header h2 {
                font-size: 1.2rem;
                word-break: break-word;
                width: 100%;
            }
            .detail-header > div {
                width: 100%;
            }
            .detail-actions {
                flex-direction: column;
            }
        }
    </style>`;
}
