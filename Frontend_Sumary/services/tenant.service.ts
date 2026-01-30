import http from "@/lib/http"; // Dùng cái mới, không dùng @/lib/api cũ
import { Result, Tenant, RegisterTenantRequest } from "@/lib/types";

// Endpoint Admin quản lý (List/Delete/Lock)
const ADMIN_ENDPOINT = "/api/admin/tenants"; 

// Endpoint tạo mới (nằm ở Auth Controller như bạn yêu cầu)
const AUTH_CREATE_ENDPOINT = "/api/auth/create-tenant";

export const tenantService = {
  // Lấy danh sách (Có hỗ trợ params phân trang nếu cần)
  getAll: async (params?: { page?: number, size?: number, keyword?: string }): Promise<Result<Tenant[]>> => {
    return await http.get(ADMIN_ENDPOINT, { params });
  },

  // Tạo mới (Dùng endpoint /auth/create-tenant)
  create: async (data: RegisterTenantRequest): Promise<Result<string>> => {
    return await http.post(AUTH_CREATE_ENDPOINT, data);
  },

  // Cập nhật thông tin
  update: async (id: string, data: any): Promise<Result<void>> => {
    return await http.put(`${ADMIN_ENDPOINT}/${id}`, data);
  },

  // Khóa / Mở khóa (Backend cần API này)
  toggleLock: async (id: string, isLocked: boolean): Promise<Result<void>> => {
    return await http.put(`${ADMIN_ENDPOINT}/${id}/lock`, { isLocked });
  },

  // Xóa
  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ADMIN_ENDPOINT}/${id}`);
  }
};