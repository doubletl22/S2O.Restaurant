
export const OrderStatus = {
  Pending: 0,
  Confirmed: 1,
  Cooking: 2,
  Ready: 3,
  Served: 4,
  Cancelled: 5
} as const;

// Tạo type từ object trên để dùng làm kiểu dữ liệu
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderItemDto {
  productId: string;
  productName?: string; // Tên món (Map từ Catalog)
  quantity: number;
  note?: string;
}
export interface StaffOrderDto {
  id: string;
  tableId: string; // Tên/Số bàn
  tableName?: string;
  status: OrderStatus;
  statusName: string;
  note?: string; // Ghi chú toàn đơn
  createdAtUtc: string;
  items: OrderItemDto[];
}