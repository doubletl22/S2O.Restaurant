// src/api/orderApi.ts
import axiosClient from './axiosClient';
// Thêm chữ "type" vào trong {}
import { type StaffOrderDto, type OrderStatus } from '../types/order'; 

export const orderApi = {
  getOrders: async (status?: OrderStatus) => {
    const params = status !== undefined ? { status } : {};
    const response = await axiosClient.get<StaffOrderDto[]>('/staff/orders', { params });
    return response.data;
  },

  getOrderDetail: async (id: string) => {
    const response = await axiosClient.get<StaffOrderDto>(`/staff/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, newStatus: OrderStatus) => {
    await axiosClient.put(`/staff/orders/${id}/status`, newStatus);
  }
};