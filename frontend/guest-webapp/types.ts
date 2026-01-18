export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryId: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type GuestOrderItemDto = {
  productId: string;
  quantity: number;
  note?: string | null;
};

export type GuestOrderPayload = {
  tableId: string;
  items: GuestOrderItemDto[];
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  note?: string | null;
};

export type LocalOrder = {
  id: string | null;
  createdAt: string;
  tableCode: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    note?: string | null;
  }>;
};
