import http from "@/lib/http";
import type { PublicMenu, PublicTableInfo, Result } from "@/lib/types";

/**
 * Convert object keys from PascalCase -> camelCase (TableId -> tableId)
 * Works recursively for nested objects/arrays.
 */
function pascalToCamelKey(key: string) {
  if (!key) return key;
  return key.charAt(0).toLowerCase() + key.slice(1);
}

function toCamelDeep<T = any>(input: any): T {
  if (Array.isArray(input)) return input.map(toCamelDeep) as any;
  if (input && typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) {
      out[pascalToCamelKey(k)] = toCamelDeep(v);
    }
    return out;
  }
  return input;
}

function isGuid(v: string) {
  // basic GUID check
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    v
  );
}

/**
 * ✅ FIX #1: Parse boolean đúng (không dùng Boolean("false"))
 * - backend hay trả "true"/"false" dạng string
 * - hoặc 1/0 dạng string/number
 */
function toBool(v: any, defaultValue: boolean) {
  if (v === undefined || v === null) return defaultValue;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "1") return true;
    if (s === "0") return false;
  }
  return defaultValue;
}

export const guestService = {
  /**
   * Resolve table info from QR token (actually tableId GUID in your QR code template)
   * Backend: GET /api/v1/storefront/tenants/resolve-table/{tableId}
   * Returns: { TableId, TableName, TenantId, TenantName, BranchId }
   */
  resolveTable: async (qrTokenOrTableId: string): Promise<PublicTableInfo> => {
    if (!qrTokenOrTableId || !isGuid(qrTokenOrTableId)) {
      throw { code: "400", description: "QR token / TableId không hợp lệ" };
    }

    const raw = (await http.get(
      `/api/v1/storefront/tenants/resolve-table/${qrTokenOrTableId}`
    )) as any;

    const data = toCamelDeep<PublicTableInfo>(raw);

    // Ensure required fields exist
    if (!data?.tenantId || !data?.tableId) {
      throw {
        code: "404",
        description: "Không tìm thấy bàn hoặc dữ liệu bàn không hợp lệ",
      };
    }

    // Normalize branchId (backend may return Guid.Empty)
    if (!data.branchId) data.branchId = "";
    return data;
  },

  /**
   * Public menu
   * Backend: GET /api/v1/storefront/menus/{tenantId}?categoryId=...
   * Controller returns Ok(result) where result is Result<PublicMenuDto>
   */
  getMenu: async (
    tenantId: string,
    categoryId?: string
  ): Promise<Result<PublicMenu>> => {
    const raw = (await http.get(`/api/v1/storefront/menus/${tenantId}`, {
      params: categoryId ? { categoryId } : undefined,
    })) as any;

    // raw is Result<PublicMenuDto> with PascalCase => camelCase
    const result = toCamelDeep<Result<any>>(raw);

    if (!result?.isSuccess || !result.value) {
      return {
        isSuccess: false,
        value: null as any,
        error: result?.error || { code: "500", description: "Không thể tải thực đơn" },
      };
    }

    const menuDto = result.value;

    /**
     * ✅ FIX #2: Map product/category “an toàn”
     * - thiếu field => mặc định coi là còn bán (true)
     * - hỗ trợ nhiều tên field backend có thể dùng: isActive/active/enabled, isAvailable/available, isSoldOut/soldOut
     * - isSoldOut ưu tiên field soldOut, nếu không có thì dùng !isAvailable
     */
    const products = (menuDto.products || []).map((p: any) => {
      const active = toBool(p.isActive ?? p.active ?? p.enabled, true);

      // isAvailable thường nghĩa là "còn hàng"
      const isAvailable = toBool(p.isAvailable ?? p.available, true);

      // nếu backend có soldOut thì dùng, không thì suy ra từ isAvailable
      const soldOut = toBool(p.isSoldOut ?? p.soldOut, false) || !isAvailable;

      return {
        id: String(p.id),
        name: p.name,
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        imageUrl: p.imageUrl ?? "",
        categoryId: String(p.categoryId),
        isActive: active,
        isSoldOut: soldOut,
      };
    });

    const categories = (menuDto.categories || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      description: c.description ?? "",
      isActive: toBool(c.isActive ?? c.active ?? c.enabled, true),
      products: (c.products || []).map((p: any) => {
        const active = toBool(p.isActive ?? p.active ?? p.enabled, true);
        const isAvailable = toBool(p.isAvailable ?? p.available, true);
        const soldOut = toBool(p.isSoldOut ?? p.soldOut, false) || !isAvailable;

        return {
          id: String(p.id),
          name: p.name,
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          imageUrl: p.imageUrl ?? "",
          categoryId: String(p.categoryId),
          isActive: active,
          isSoldOut: soldOut,
        };
      }),
    }));

    return {
      isSuccess: true,
      value: { categories, products },
    };
  },

  /**
   * Full flow: resolve table -> get menu
   */
  getMenuByToken: async (
    qrToken: string
  ): Promise<Result<{ table: PublicTableInfo; menu: PublicMenu }>> => {
    try {
      const table = await guestService.resolveTable(qrToken);
      const menuRes = await guestService.getMenu(table.tenantId);

      if (!menuRes.isSuccess) {
        return { isSuccess: false, value: null as any, error: menuRes.error };
      }

      return { isSuccess: true, value: { table, menu: menuRes.value } };
    } catch (error: any) {
      return {
        isSuccess: false,
        value: null as any,
        error: error?.error || error || { code: "500", description: "Lỗi tải dữ liệu" },
      };
    }
  },

  /**
   * Place order (backend accepts extra fields too, it will ignore unknown props)
   * Backend: POST /api/v1/storefront/orders/guest (PlaceGuestOrderCommand)
   * expects: { tableId, tenantId, items: [{productId, name, quantity, note}] }
   */
  placeOrder: async (payload: any) => {
    return (await http.post("/api/v1/storefront/orders/guest", payload)) as any;
  },

  /**
   * Backend currently does NOT provide GET order-by-table for guest.
   * We'll return a local fallback structure from localStorage so UI doesn't crash.
   */
  getOrdersLocal: async (): Promise<Result<{ items: any[]; totalAmount: number }>> => {
    try {
      const raw = localStorage.getItem("guest_last_order");
      if (!raw) return { isSuccess: true, value: { items: [], totalAmount: 0 } };
      const data = JSON.parse(raw);
      return {
        isSuccess: true,
        value: { items: data.items || [], totalAmount: data.totalAmount || 0 },
      };
    } catch {
      return { isSuccess: true, value: { items: [], totalAmount: 0 } };
    }
  },

  /**
   * Poll order status by orderId (try multiple endpoints - tùy backend bạn đang có)
   * Trả về Result<OrderLike>
   */
  getOrderStatus: async (orderId: string): Promise<Result<any>> => {
    if (!orderId) {
      return {
        isSuccess: false,
        value: null as any,
        error: { code: "400", description: "orderId không hợp lệ" },
      };
    }

    const endpoints = [
      `/api/v1/storefront/orders/${orderId}`,
      `/api/v1/storefront/orders/guest/${orderId}`,
      `/api/v1/orders/${orderId}`,
      `/api/orders/${orderId}`,
    ];

    for (const url of endpoints) {
      try {
        const raw = (await http.get(url)) as any;
        const data = toCamelDeep<any>(raw);

        // Case A: backend trả Result<T>
        if (data?.isSuccess === true && data?.value) {
          return { isSuccess: true, value: data.value };
        }

        // Case B: backend trả thẳng order object
        if (
          data &&
          (data.id || data.orderId) &&
          (data.status !== undefined ||
            data.orderStatus !== undefined ||
            data.state !== undefined)
        ) {
          return { isSuccess: true, value: data };
        }
      } catch {
        // thử endpoint khác
      }
    }

    return {
      isSuccess: false,
      value: null as any,
      error: { code: "404", description: "Backend chưa có API lấy trạng thái đơn hàng" },
    };
  },
};
