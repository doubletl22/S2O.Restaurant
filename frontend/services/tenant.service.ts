import http from "@/lib/http";
import { Result, Tenant, RegisterTenantRequest } from "@/lib/types";

const ENDPOINT = "/api/v1/tenants";

export const tenantService = {
  // GET All
  getAll: async (): Promise<Result<Tenant[]>> => {
    // Interceptor đã trả về data (Result object), ta chỉ cần ép kiểu về Result<Tenant[]>
    const response = await http.get<Result<Tenant[]>>(ENDPOINT);
    return response as unknown as Result<Tenant[]>;
  },

  // Create
  create: async (data: RegisterTenantRequest): Promise<Result<string>> => {
    const response = await http.post<Result<string>>(`${ENDPOINT}/registration`, data);
    return response as unknown as Result<string>;
  },

  // Lock/Unlock
  toggleLock: async (id: string, isLocked: boolean): Promise<Result<void>> => {
    const action = isLocked ? "lock" : "unlock";
    const response = await http.post<Result<void>>(`${ENDPOINT}/${id}/${action}`, {});
    return response as unknown as Result<void>;
  },

  // Delete
  delete: async (id: string): Promise<Result<void>> => {
    const response = await http.delete<Result<void>>(`${ENDPOINT}/${id}`);
    return response as unknown as Result<void>;
  }
};