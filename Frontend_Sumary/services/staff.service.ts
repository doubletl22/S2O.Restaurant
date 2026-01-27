import api from '@/lib/api';

export interface StaffDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;      // Ví dụ: 'RestaurantStaff', 'Chef', 'Manager'
  branchId: string;  // Nhân viên thuộc chi nhánh nào
  branchName?: string;
  isActive: boolean;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  branchId: string;
}

export const staffService = {
  // Lấy danh sách nhân viên
  getAll: async () => {
    // API: GET /api/owner/staff
    // Lưu ý: Bạn cần đảm bảo Backend Identity/Tenant có endpoint này
    const response = await api.get<StaffDto[]>('/owner/staff');
    return response.data;
  },

  // Tạo nhân viên mới
  create: async (payload: CreateStaffPayload) => {
    // API: POST /api/auth/staff (được route qua Ocelot vào /api/owner/staff của Identity)
    const response = await api.post('/auth/staff', payload);
    return response.data;
  },

  // Khóa/Xóa nhân viên
  delete: async (id: string) => {
    const response = await api.delete(`/owner/staff/${id}`);
    return response.data;
  }
};