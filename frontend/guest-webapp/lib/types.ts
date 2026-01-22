export type ResultLike<T> = {
  isSuccess?: boolean;
  IsSuccess?: boolean;
  value?: T;
  Value?: T;
  error?: any;
  Error?: any;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  categoryId?: string;
  // đôi khi backend trả kèm category
  category?: { id: string; name: string } | null;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  note?: string;
};

export type GuestSession = {
  tenantId: string;
  branchId: string;
  tableId: string;
  lastActiveAt: number;
  expiresAt: number;
};

export type PlaceGuestOrderPayload = {
  tenantId: string;
  branchId: string;
  tableId: string;
  guestName: string;
  guestPhone?: string;
  items: { productId: string; quantity: number; note?: string }[];
};

export type LocalOrder = {
  orderId: string;
  createdAt: number;
  status: string; // pending/confirmed/preparing/served/completed/cancelled...
  totalAmount: number;
  items: CartItem[];
};
