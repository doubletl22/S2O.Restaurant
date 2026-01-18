import type { LocalOrder } from "@/types";

function ordersKey(scopeKey: string) {
  return `s2o_guest_orders:${scopeKey}`;
}
function billKey(scopeKey: string) {
  return `s2o_guest_bill:${scopeKey}`;
}

export function getLocalOrders(scopeKey: string): LocalOrder[] {
  try {
    const raw = localStorage.getItem(ordersKey(scopeKey)) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addLocalOrder(scopeKey: string, order: LocalOrder) {
  const arr = getLocalOrders(scopeKey);
  arr.unshift(order);
  localStorage.setItem(ordersKey(scopeKey), JSON.stringify(arr));
}

export function clearLocalOrders(scopeKey: string) {
  localStorage.removeItem(ordersKey(scopeKey));
}

export function setBillRequested(scopeKey: string, v: boolean) {
  localStorage.setItem(billKey(scopeKey), v ? "1" : "0");
}
export function getBillRequested(scopeKey: string) {
  return localStorage.getItem(billKey(scopeKey)) === "1";
}
