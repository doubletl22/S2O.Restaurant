export type GuestSession = {
  sessionId: string;
  tenantId: string;
  branchId: string;
  tableId: string;
  tableLabel?: string;
  qrToken: string;
  expiresAt: string; // ISO
};

export type MenuCategory = {
  id: string;
  name: string;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number; // VND
  isAvailable?: boolean;
};

export type CartItem = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  notes: string;
};

export type OrderItemStatus = "pending" | "preparing" | "cooking" | "served" | "cancelled";

export type OrderItemView = {
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  notes?: string;
  status: OrderItemStatus;
};

export type OrderView = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  orderedAt: string; // ISO
  totalAmount: number;
  items: OrderItemView[];
};

export type LoyaltyProfile = {
  customerId: string;
  fullName?: string;
  phone?: string;
  tier: string;
  loyaltyPoints: number;
};
