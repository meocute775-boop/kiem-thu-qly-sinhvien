// API Service - Kết nối với Backend

// ============ CONFIGURATION ============
// Để dùng NGROK: Uncomment dòng dưới và paste URL ngrok của bạn
const NGROK_URL =
    "https://heterotrichous-groundable-elliott.ngrok-free.dev/api";

// Để dùng LOCAL: Comment dòng NGROK_URL ở trên
// const LOCAL_URL = "http://localhost:3000/api";

// Auto-detect: Ưu tiên NGROK nếu có, không thì dùng LOCAL
const API_BASE_URL = typeof NGROK_URL !== "undefined" ? NGROK_URL : LOCAL_URL;
// ========================================

console.log("🔗 API Base URL:", API_BASE_URL);

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Helper method để gọi API
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            credentials: "include", // Gửi cookie session
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Nếu lỗi 401 (Unauthorized), xóa session và reload về login
                if (response.status === 401) {
                    sessionStorage.clear();
                    window.location.reload();
                    return;
                }
                throw new Error(data.message || "Có lỗi xảy ra");
            }

            return data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    // ==================== AUTH APIs ====================

    async login(email, password) {
        return this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userData) {
        return this.request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        return this.request("/auth/logout", {
            method: "POST",
        });
    }

    async getCurrentUser() {
        return this.request("/auth/me");
    }

    async changePassword(currentPassword, newPassword) {
        return this.request("/auth/change-password", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    // ==================== STUDENT APIs ====================

    async getStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/students?${queryString}` : "/students";
        return this.request(endpoint);
    }

    async getStudentById(id) {
        return this.request(`/students/${id}`);
    }

    async addStudent(studentData) {
        return this.request("/students", {
            method: "POST",
            body: JSON.stringify(studentData),
        });
    }

    async updateStudent(id, studentData) {
        return this.request(`/students/${id}`, {
            method: "PUT",
            body: JSON.stringify(studentData),
        });
    }

    async updateStudentStatus(id, status) {
        return this.request(`/students/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    async deleteStudent(id) {
        return this.request(`/students/${id}`, {
            method: "DELETE",
        });
    }

    async bulkDeleteStudents(ids) {
        return this.request("/students/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    }

    async getStatistics() {
        return this.request("/students/statistics/summary");
    }
}

// Export instance
const apiService = new ApiService();
