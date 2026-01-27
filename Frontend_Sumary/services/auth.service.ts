// services/auth.service.ts
import api from '@/lib/api';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  login: async (email: string, password: string) => {
    // API: POST /api/auth/login
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },
  
  logout: () => {
    // Xóa cookie/localStorage
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};