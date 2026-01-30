import http from "@/lib/http";
import { Result, StaffProfile, CreateStaffRequest } from "@/lib/types";

// Endpoint trỏ về Identity Service -> OwnerStaffController
const ENDPOINT = "/api/owner-staff"; 

export const ownerStaffService = {
  // Lấy danh sách nhân viên của Owner
  getAll: async (): Promise<Result<StaffProfile[]>> => {
    return await http.get(ENDPOINT);
  },

  // Tạo nhân viên mới
  create: async (data: CreateStaffRequest): Promise<Result<string>> => {
    return await http.post(ENDPOINT, data);
  },

  // Cập nhật thông tin (nếu cần)
  update: async (id: string, data: Partial<CreateStaffRequest>): Promise<Result<void>> => {
    return await http.put(`${ENDPOINT}/${id}`, data);
  },

  // Xóa nhân viên (hoặc khóa)
  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  }
};