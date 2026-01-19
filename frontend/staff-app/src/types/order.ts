
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

export interface StaffOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface StaffOrderDto {
  id: string;
  tableId: string;
  note: string;
  totalAmount: number;
  status: OrderStatus;
  statusName: string; // Backend trả về string tên enum
  createdAtUtc: string;
  items: StaffOrderItemDto[];
}