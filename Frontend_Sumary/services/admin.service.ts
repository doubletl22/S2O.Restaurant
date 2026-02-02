import http from "@/lib/http";
import { PagedResult, User, Result, SysAdminStats } from "@/lib/types";

export const adminService = {
  getStats: async (): Promise<Result<SysAdminStats>> => {
    const res = await http.get<Result<SysAdminStats>>("/api/v1/admin/stats");
    return res as unknown as Result<SysAdminStats>;
  },
  
  getSystemUsers: async (params?: any): Promise<PagedResult<User>> => {
    const res = await http.get<PagedResult<User>>("/api/users", { params });
    return res as unknown as PagedResult<User>;
  },

  createUser: async (data: any) => {
    return (await http.post("/api/users", data)) as unknown;
  },
  
  getUserById: async (id: string) => (await http.get<User>(`/api/users/${id}`)) as unknown as User,
  
  deleteUser: async (id: string) => (await http.delete(`/api/users/${id}`)) as unknown,
  
  lockUser: async (id: string) => (await http.post(`/api/users/${id}/lock`, {})) as unknown,
  
  unlockUser: async (id: string) => (await http.post(`/api/users/${id}/unlock`, {})) as unknown,
  
  resetPassword: async (userId: string, newPassword: string) => 
    (await http.put(`/api/users/${userId}/reset-password`, { newPassword })) as unknown
};