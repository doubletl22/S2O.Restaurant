export function moneyVND(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("vi-VN") + " ₫";
}

export function shortId(id: string, n = 6) {
  if (!id) return "";
  return id.replace(/-/g, "").slice(0, n).toUpperCase();
}

export function now() {
  return Date.now();
}
