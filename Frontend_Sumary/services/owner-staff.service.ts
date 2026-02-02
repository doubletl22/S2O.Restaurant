import http from "@/lib/http";
import { StaffProfile, CreateStaffRequest, Result } from "@/lib/types";

const ENDPOINT = "/api/v1/staffs"; // Hoặc /api/v1/owner/staffs tùy route backend

export const ownerStaffService = {
  // Lấy danh sách nhân viên
  getAll: async (keyword?: string): Promise<Result<StaffProfile[]>> => {
    return await http.get(ENDPOINT, { params: { keyword } });
  },

  // Tạo nhân viên mới
  create: async (data: CreateStaffRequest): Promise<Result<string>> => {
    return await http.post(ENDPOINT, data);
  },

  // Xóa nhân viên
  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  },
  
  // Cập nhật (nếu cần)
  update: async (id: string, data: any): Promise<Result<void>> => {
    return await http.put(`${ENDPOINT}/${id}`, data);
  }
};