export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tableId: string;
  note: string;
  // 0:Pending, 1:Confirmed, 2:Cooking, 3:Ready, 4:Completed, 5:Cancelled
  status: number; 
  statusName: string;
  createdAtUtc: string;
  items: OrderItem[];
  branchId?: string;
  totalAmount?: number;
}