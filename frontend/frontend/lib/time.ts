export function msUntil(iso: string) {
  const t = new Date(iso).getTime();
  return t - Date.now();
}

export function formatMoneyVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
}
