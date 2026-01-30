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

/* ✅ ĐÃ BỔ SUNG ownerName */
export interface CreateTenantPayload {
  name: string;
  ownerName: string; // 👈 thêm dòng này
  email: string;
  password?: string;
  phone: string;
  address: string;
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
}

export const adminService = {

  // 1. Lấy danh sách Tenant
  getAllTenants: async () => {
    const response = await api.get<TenantDto[]>('/admin/tenants');
    return response.data;
  },

  // 2. Tạo Tenant mới ✅ FIX FULL FLOW
  createTenant: async (payload: CreateTenantPayload) => {

    /* ✅ Build body đúng backend Identity cần */
    const body = {
      RestaurantName: payload.name,
      OwnerName: payload.ownerName || payload.name, // nếu chưa nhập thì lấy tạm name
      Email: payload.email,
      Password: payload.password || "Password123!",
      Address: payload.address,
      PhoneNumber: payload.phone,
      PlanType: payload.subscriptionPlan,
    };

    /* ✅ API đúng */
    const response = await api.post('/auth/create-tenant', body);

    return response.data;
  },

  // 3. Khóa/Mở khóa Tenant
  toggleLockTenant: async (tenantId: string, isLocked: boolean) => {
    const action = isLocked ? 'unlock' : 'lock';
    const response = await api.post(`/admin/tenants/${tenantId}/${action}`);
    return response.data;
  }
};
