<<<<<<< HEAD
export function msUntil(iso: string) {
  const t = new Date(iso).getTime();
  return t - Date.now();
}

export function formatMoneyVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
}
=======
export function msUntil(iso: string) {
  const t = new Date(iso).getTime();
  return t - Date.now();
}

export function formatMoneyVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
