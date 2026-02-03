import http from "@/lib/http";
import { StaffProfile, CreateStaffRequest, Result } from "@/lib/types";

const ENDPOINT = "/api/v1/staff";

export const ownerStaffService = {
  // GET /api/v1/staff?keyword=...
  getAll: async (keyword?: string): Promise<Result<StaffProfile[]>> => {
    return await http.get(ENDPOINT, { params: { keyword } });
  },

  // POST /api/v1/staff
  create: async (data: CreateStaffRequest): Promise<Result<string>> => {
    // Map đúng payload theo RegisterStaffCommand:
    // Username, FullName, Email, Password, BranchId
    const payload = {
      username: data.email, // dùng email làm username
      fullName: data.fullName,
      email: data.email,
      password: data.password || "",
      branchId: data.branchId,
    };

    return await http.post(ENDPOINT, payload);
  },

  // Nếu bạn muốn xoá/disable staff, cần thêm endpoint backend.
  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  },

  update: async (id: string, data: any): Promise<Result<void>> => {
    return await http.put(`${ENDPOINT}/${id}`, data);
  },
};
