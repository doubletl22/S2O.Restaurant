export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function base64UrlDecode(str: string) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
}

export function getJwtPayload(): any | null {
  const token = getAccessToken();
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function getClaim(name: string): string | null {
  const p = getJwtPayload();
  const v = p?.[name];
  if (!v) return null;
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : String(v);
}

// Helper: Lấy BranchId từ JWT token
export function getBranchId(): string | null {
  return getClaim("BranchId") || getClaim("branchId") || getClaim("branch_id");
}

// Helper: Lấy UserId từ JWT token
export function getUserId(): string | null {
  return getClaim("sub") || getClaim("userId") || getClaim("UserId");
}

export function getRoles(): string[] {
  const p = getJwtPayload();
  if (!p) return [];

  const raw =
    p?.role ??
    p?.roles ??
    p?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r));
  return [String(raw)];
}