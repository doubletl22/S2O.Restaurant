import http from "@/lib/http";
import { Result, Tenant, RegisterTenantRequest } from "@/lib/types";

const ENDPOINT = "/api/v1/tenants";

export const tenantService = {
  // GET All - ITC_4.1: Tìm kiếm đa mục tiêu, ITC_4.4: Authorization check
  getAll: async (keyword?: string): Promise<Result<Tenant[]>> => {
    try {
      const response = await http.get<Result<Tenant[]>>(ENDPOINT, { params: { keyword } });
      return response as unknown as Result<Tenant[]>;
    } catch (error: any) {
      // ITC_4.4: Handle 403 Forbidden for authorization error
      if (error?.status === 403 || error?.response?.status === 403) {
        return {
          isSuccess: false,
          statusCode: 403,
          error: {
            code: "FORBIDDEN",
            message: "Bạn không có quyền truy cập trang này. Chỉ Admin có thể quản lý danh sách nhà hàng."
          },
          value: []
        } as unknown as Result<Tenant[]>;
      }
      throw error;
    }
  },

  // Create
  create: async (data: RegisterTenantRequest): Promise<Result<string>> => {
    const response = await http.post<Result<string>>(`${ENDPOINT}/registration`, data);
    return response as unknown as Result<string>;
  },

  // Lock/Unlock - ITC_6
  toggleLock: async (
    id: string,
    isLocked: boolean,
    payload?: { reason: string; lockDurationDays?: number; isPermanent?: boolean }
  ): Promise<Result<void>> => {
    const action = isLocked ? "lock" : "unlock";
    const requestBody = isLocked
      ? {
          reason: payload?.reason ?? "",
          lockDurationDays: payload?.lockDurationDays ?? 0,
          isPermanent: payload?.isPermanent ?? false,
        }
      : {};
    const response = await http.post<Result<void>>(`${ENDPOINT}/${id}/${action}`, requestBody);
    return response as unknown as Result<void>;
  },

  // Delete
  delete: async (id: string): Promise<Result<void>> => {
    const response = await http.delete<Result<void>>(`${ENDPOINT}/${id}`);
    return response as unknown as Result<void>;
  },

  // Renew subscription (SystemAdmin)
  renewSubscription: async (id: string, months = 1): Promise<Result<void>> => {
    const response = await http.post<Result<void>>(`/api/v1/admin/tenants/${id}/renew`, null, {
      params: { months }
    });
    return response as unknown as Result<void>;
  }
};