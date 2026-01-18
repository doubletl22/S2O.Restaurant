import axios from "axios";
import type { GuestOrderPayload, Product } from "@/types";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000";

type ResultLike<T> =
  | { IsSuccess: boolean; Value: T; Error?: any }
  | { isSuccess: boolean; value: T; error?: any }
  | T;

function pickErrorMessage(data: any): string {
  // gateway/services thường trả {Code, Description} hoặc ProblemDetails {title}
  const msg =
    data?.Error?.Description ||
    data?.error?.description ||
    data?.title ||
    data?.message ||
    data?.Error ||
    data?.error;
  return typeof msg === "string" ? msg : "Request failed";
}

function unwrapResult<T>(data: ResultLike<T>): T {
  if (data && typeof data === "object") {
    if ("IsSuccess" in data) {
      if ((data as any).IsSuccess) return (data as any).Value as T;
      throw new Error(pickErrorMessage(data));
    }
    if ("isSuccess" in data) {
      if ((data as any).isSuccess) return (data as any).value as T;
      throw new Error(pickErrorMessage(data));
    }
  }
  return data as T;
}

export function makeApi(tenantId: string) {
  return axios.create({
    baseURL: API_BASE,
    timeout: 20000,
    headers: {
      "X-Tenant-Id": tenantId
    }
  });
}

/**
 * GET /api/public/menu
 * return Result<List<Product>> (PascalCase) theo backend của bạn
 */
export async function fetchPublicMenu(tenantId: string): Promise<Product[]> {
  const api = makeApi(tenantId);
  const res = await api.get("/api/public/menu");
  return unwrapResult<Product[]>(res.data);
}

/**
 * POST /api/orders/guest
 * Body: { tableId, items:[{productId, quantity, note}] }
 * return: Guid (string) theo controller: Ok(result.Value)
 */
export async function placeGuestOrder(tenantId: string, payload: GuestOrderPayload): Promise<string | null> {
  const api = makeApi(tenantId);
  const res = await api.post("/api/orders/guest", payload);
  // thành công thường trả string guid, fail thì controller BadRequest(Error)
  if (typeof res.data === "string") return res.data;
  if (res.data && typeof res.data === "object") {
    // nếu sau này đổi trả Result<Guid> thì vẫn unwrap
    try {
      const v = unwrapResult<string>(res.data as any);
      return v;
    } catch {
      // fallback
      return null;
    }
  }
  return null;
}
