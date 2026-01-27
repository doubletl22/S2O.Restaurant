import api from '@/lib/api';

export interface TenantDto {
  id: string;
  name: string;
  email: string; // Email admin của tenant
  phoneNumber?: string;
  address?: string;
  subscriptionPlan: string;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  validUntil: string;
}

export interface CreateTenantPayload {
  name: string;
  email: string;
  password?: string; // Optional nếu tự sinh
  phone: string;
  address: string;
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
}

export const adminService = {
  // 1. Lấy danh sách Tenant (Gọi qua Gateway -> Tenant Service)
  getAllTenants: async () => {
    // API: GET /api/admin/tenants
    const response = await api.get<TenantDto[]>('/admin/tenants');
    return response.data;
  },

  // 2. Tạo Tenant mới (Gọi qua Gateway -> Identity Service)
  createTenant: async (payload: CreateTenantPayload) => {
    // API: POST /api/sysadmin/tenants
    // Backend Identity sẽ tạo User -> Publish Event -> Tenant Service tạo Tenant
    const response = await api.post('/sysadmin/tenants', payload);
    return response.data;
  },

  // 3. Khóa/Mở khóa Tenant
  toggleLockTenant: async (tenantId: string, isLocked: boolean) => {
    // API: POST /api/admin/tenants/{id}/lock hoặc unlock
    const action = isLocked ? 'unlock' : 'lock'; 
    const response = await api.post(`/admin/tenants/${tenantId}/${action}`);
    return response.data;
  }
};