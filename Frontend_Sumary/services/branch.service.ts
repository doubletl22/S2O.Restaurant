import api from '@/lib/api';

export interface BranchDto {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  isMainBranch?: boolean; // Nếu có logic chi nhánh chính
}

export interface CreateBranchPayload {
  name: string;
  address: string;
  phoneNumber: string;
}

export interface UpdateBranchPayload {
  name: string;
  address: string;
  phoneNumber: string;
  isActive?: boolean;
}

export const branchService = {
  // Lấy danh sách chi nhánh
  getAll: async () => {
    // API: GET /api/branches
    const response = await api.get<BranchDto[]>('/branches');
    return response.data;
  },

  // Tạo chi nhánh mới
  create: async (payload: CreateBranchPayload) => {
    // API: POST /api/branches
    const response = await api.post('/branches', payload);
    return response.data;
  },

  // Cập nhật chi nhánh
  update: async (id: string, payload: UpdateBranchPayload) => {
    // API: PUT /api/branches/{id}
    const response = await api.put(`/branches/${id}`, payload);
    return response.data;
  },

  // Xóa chi nhánh (nếu có)
  delete: async (id: string) => {
    // API: DELETE /api/branches/{id}
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  }
};