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
   * Resolve table info from QR token.
   * Backend: GET /api/v1/storefront/tenants/resolve-table/{token}
   * token can be tableId GUID, qr token, or token embedded in full URL.
   * Returns: { TableId, TableName, TenantId, TenantName, BranchId }
   */
  resolveTable: async (qrTokenOrTableId: string): Promise<PublicTableInfo> => {
    if (!qrTokenOrTableId || !String(qrTokenOrTableId).trim()) {
      throw { code: "400", description: "QR token / TableId không hợp lệ" };
    }

    const token = encodeURIComponent(String(qrTokenOrTableId).trim());
    const raw = (await http.get(
      `/api/v1/storefront/tenants/resolve-table/${token}`
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
      const fallback = "Mã QR không hợp lệ hoặc đã hết hiệu lực. Vui lòng quét lại mã mới.";
      const normalizedError =
        typeof error === "string"
          ? { code: "404", description: error || fallback }
          : {
              code:
                error?.code ||
                error?.error?.code ||
                error?.status?.toString?.() ||
                "500",
              description:
                error?.description ||
                error?.error?.description ||
                error?.message ||
                fallback,
            };

      return {
        isSuccess: false,
        value: null as any,
        error: normalizedError,
      };
    }
  },

  /**
   * Add items to an existing guest order
   * Backend: POST /api/v1/storefront/orders/{id}/items
   */
  addItemsToOrder: async (
    orderId: string,
    payload: { tenantId: string; items: { productId: string; name: string; quantity: number; note: string }[] }
  ): Promise<Result<null>> => {
    try {
      const resp = (await http.post(`/api/v1/storefront/orders/${orderId}/items`, payload)) as any;
      if (typeof resp === 'object' && 'isSuccess' in resp) return resp;
      return { isSuccess: true, value: null };
    } catch (error: any) {
      const errorData = error?.response?.data || error;
      if (errorData?.isSuccess === false) {
        return { isSuccess: false, value: null, error: errorData?.error || { code: "500", description: "Lỗi không xác định" } };
      }
      const fallbackMsg = errorData?.message || errorData?.description || "Lỗi khi thêm món";
      return { isSuccess: false, value: null, error: { code: error?.response?.status?.toString() || "500", description: String(fallbackMsg) } };
    }
  },

  /**
   * Place order - wraps error responses into Result format
   * Backend: POST /api/v1/storefront/orders/guest (PlaceGuestOrderCommand)
    * expects: { tableId, tableName, tenantId, branchId, items: [{productId, name, quantity, note}] }
   */
  placeOrder: async (payload: any): Promise<Result<{orderId: string}>> => {
    try {
      const resp = (await http.post("/api/v1/storefront/orders/guest", payload)) as any;
      
      // ✅ Nếu backend trả {isSuccess, value/error}, return như vậy
      if (typeof resp === 'object' && 'isSuccess' in resp) {
        return resp;
      }
      
      // ✅ Nếu backend trả raw id/orderId (success), wrap vào Result
      if (resp) {
        return { isSuccess: true, value: { orderId: resp?.id ?? resp?.orderId ?? resp } };
      }
      
      return { isSuccess: true, value: { orderId: resp?.id ?? resp?.orderId ?? "UNKNOWN" } };
    } catch (error: any) {
      // ✅ Catch Axios error từ http interceptor reject
      const errorData = error?.response?.data || error;
      
      // Nếu backend trả {isSuccess:false, error:{...}}, extract nó
      if (errorData?.isSuccess === false) {
        return {
          isSuccess: false,
          value: null as any,
          error: errorData?.error || { code: "500", description: "Lỗi không xác định" },
        };
      }
      
      // Nếu là ASP.NET validation error
      if (errorData?.errors && typeof errorData.errors === 'object') {
        const firstKey = Object.keys(errorData.errors)[0];
        const msg = (errorData.errors as any)[firstKey];
        const desc = Array.isArray(msg) ? msg[0] : msg;
        return {
          isSuccess: false,
          value: null as any,
          error: { code: "400", description: String(desc || "Dữ liệu không hợp lệ") },
        };
      }
      
      // Fallback
      const fallbackMsg = errorData?.message || errorData?.description || "Lỗi khi đặt món";
      return {
        isSuccess: false,
        value: null as any,
        error: { code: error?.response?.status?.toString() || "500", description: String(fallbackMsg) },
      };
    }
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
   * Poll order status by orderId
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

    try {
      const raw = (await http.get(`/api/v1/storefront/orders/${orderId}`)) as any;
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
      // endpoint không phản hồi
    }

    return {
      isSuccess: false,
      value: null as any,
      error: { code: "404", description: "Không tìm thấy trạng thái đơn hàng" },
    };
  },
};
