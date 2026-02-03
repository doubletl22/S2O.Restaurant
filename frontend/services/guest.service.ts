import http from "@/lib/http";
import { PublicMenu, TableInfo, Result, Order } from "@/lib/types";

/* ===================== Helpers ===================== */
function pick<T>(obj: any, camel: string, pascal: string): T {
  return (obj?.[camel] ?? obj?.[pascal]) as T;
}

function unwrap(res: any) {
  // backend hay trả Result<T>: {isSuccess,value,error}
  if (res && typeof res === "object") {
    if ("isSuccess" in res) return { ok: !!res.isSuccess, value: res.value, error: res.error };
    if ("IsSuccess" in res) return { ok: !!res.IsSuccess, value: res.Value, error: res.Error };
  }
  return { ok: true, value: res, error: null };
}

// ✅ TRY LIST endpoint theo ưu tiên (đúng theo backend bạn đang hướng tới)
const ENDPOINTS = {
  resolveTable: (qrToken: string) => [
    `/api/v1/storefront/tenants/resolve-table/${qrToken}`,
    `/api/storefront/tenants/resolve-table/${qrToken}`,
  ],
  menu: (tenantId: string) => [
    `/api/v1/storefront/menus/${tenantId}`,
    `/api/storefront/menus/${tenantId}`,
    `/api/public/menu/${tenantId}`, // nếu project cũ có public menu
  ],
  placeOrder: () => [
    `/api/v1/storefront/orders/guest`,
    `/api/storefront/orders/guest`,
    `/api/v1/storefront/orders`,
    `/api/storefront/orders`,
  ],
  ordersByTable: (tableId: string) => [
    `/api/v1/storefront/orders/table/${tableId}`,
    `/api/storefront/orders/table/${tableId}`,
  ],
  requestBill: () => [
    `/api/v1/storefront/orders/request-bill`,
    `/api/storefront/orders/request-bill`,
  ],
};

async function postTry(urls: string[], body: any, config?: any) {
  let lastErr: any = null;
  for (const u of urls) {
    try {
      const res = await http.post(u, body, config);
      const r = unwrap(res);
      if (!r.ok) throw new Error(r.error?.description || "Request failed");
      return r.value;
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Không gọi được endpoint nào");
}

async function getTry(urls: string[], config?: any) {
  let lastErr: any = null;
  for (const u of urls) {
    try {
      const res = await http.get(u, config);
      const r = unwrap(res);
      if (!r.ok) throw new Error(r.error?.description || "Request failed");
      return r.value;
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Không gọi được endpoint nào");
}

/* ===================== Guest Service ===================== */
export const guestService = {
  /* ===== Resolve QR bàn ===== */
  resolveTable: async (qrToken: string): Promise<TableInfo> => {
    const v = await getTry(ENDPOINTS.resolveTable(qrToken));

    return {
      tableId: pick<string>(v, "tableId", "TableId"),
      tableName: pick<string>(v, "tableName", "TableName"),
      tenantId: pick<string>(v, "tenantId", "TenantId"),
      tenantName: pick<string>(v, "tenantName", "TenantName"),
      branchId: pick<string>(v, "branchId", "BranchId"),
    };
  },

  /* ===== Lấy menu public ===== */
  getMenu: async (tenantId: string, categoryId?: string): Promise<PublicMenu> => {
    // ✅ Guest route rất hay cần X-Tenant-ID để gateway route đúng
    const v = await getTry(ENDPOINTS.menu(tenantId), {
      params: { categoryId },
      headers: { "X-Tenant-ID": tenantId },
    });

    return {
      tenantId: pick<string>(v, "tenantId", "TenantId") || tenantId,
      categories: pick<any[]>(v, "categories", "Categories") || [],
      products: pick<any[]>(v, "products", "Products") || [],
    };
  },

  /* ===== Resolve QR + Menu 1 lần ===== */
  getMenuByToken: async (
    qrToken: string
  ): Promise<Result<{ table: TableInfo; menu: PublicMenu }>> => {
    try {
      const table = await guestService.resolveTable(qrToken);
      const menu = await guestService.getMenu(table.tenantId);
      return { isSuccess: true, value: { table, menu } } as any;
    } catch (error: any) {
      return { isSuccess: false, value: null as any, error } as any;
    }
  },

  /* ===== Đặt món guest (FIX 404 + tenant header) ===== */
  placeOrder: async (payload: {
    tenantId: string;
    tableId: string;
    items: { productId: string; name?: string; quantity: number; note?: string }[];
  }) => {
    const Items = payload.items.map((x) => ({
      ProductId: x.productId,
      MenuItemId: x.productId, // backend cũ
      Name: x.name,
      Quantity: x.quantity,
      Note: x.note || "",
    }));

    // ✅ body giữ cả camel + pascal để “ăn” mọi backend
    const body: any = {
      tenantId: payload.tenantId,
      tableId: payload.tableId,
      items: payload.items.map((x) => ({
        productId: x.productId,
        name: x.name,
        quantity: x.quantity,
        note: x.note || "",
      })),

      TenantId: payload.tenantId,
      TableId: payload.tableId,
      Items,
      OrderItems: Items,
    };

    // ✅ cực quan trọng cho gateway: gửi tenant header
    const config = { headers: { "X-Tenant-ID": payload.tenantId } };

    return await postTry(ENDPOINTS.placeOrder(), body, config);
  },

  /* ===== Lấy đơn theo QR ===== */
  getOrdersByQrToken: async (qrToken: string): Promise<Order[]> => {
    const table = await guestService.resolveTable(qrToken);
    const v = await getTry(ENDPOINTS.ordersByTable(table.tableId), {
      headers: { "X-Tenant-ID": table.tenantId },
    });
    return v;
  },

  /* ===== Gọi thanh toán ===== */
  requestBill: async (qrToken: string) => {
    const table = await guestService.resolveTable(qrToken);

    const body = {
      tenantId: table.tenantId,
      tableId: table.tableId,
      TenantId: table.tenantId,
      TableId: table.tableId,
    };

    return await postTry(ENDPOINTS.requestBill(), body, {
      headers: { "X-Tenant-ID": table.tenantId },
    });
  },

  /* ===== Stub tương thích code cũ ===== */
  getOrders: async (_qrToken: string): Promise<Result<Order[]>> => {
    try {
      const data = await guestService.getOrdersByQrToken(_qrToken);
      return { isSuccess: true, value: data } as any;
    } catch (error: any) {
      return { isSuccess: false, value: [], error } as any;
    }
  },
};
