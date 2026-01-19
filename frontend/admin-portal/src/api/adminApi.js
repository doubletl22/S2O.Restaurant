import axios from 'axios';

// Cấu hình Axios cơ bản gọi qua Gateway
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Gateway Port
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm Token của Chủ quán
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ownerToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminApi = {
  // --- AUTH & STAFF (Identity Service) ---
  login: (creds) => axiosClient.post('/auth/login', creds),
  // Tạo nhân viên bếp/phục vụ
  createStaff: (data) => axiosClient.post('/auth/register-staff', data),
  // Lấy danh sách nhân viên (Cần endpoint GetUsers ở Identity Service)
  getStaffs: () => axiosClient.get('/users/staffs'),

  // --- MENU & CATEGORY (Catalog Service) ---
  // Lấy danh mục món (Ví dụ: Khai vị, Món chính)
  getCategories: () => axiosClient.get('/categories'),
  createCategory: (data) => axiosClient.post('/categories', data),
  // Quản lý món ăn
  getProducts: (tenantId) => axiosClient.get(`/products/${tenantId}`),
  createProduct: (data) => axiosClient.post('/products', data),

  // --- TABLE & BRANCH (Tenant Service) ---
  // Lấy danh sách bàn theo chi nhánh
  getTables: (branchId) => axiosClient.get(`/tables?branchId=${branchId}`),
  createTable: (data) => axiosClient.post('/tables', data),
  getBranches: () => axiosClient.get('/tenants/branches'),
};