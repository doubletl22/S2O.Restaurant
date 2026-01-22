"use client";

import { readJSON, writeJSON } from "./storage";
import type { LocalOrder } from "./types";
import { getSession } from "./session";

const EVT = "s2o:orders";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVT));
}

function keyForSession() {
  const s = getSession();
  if (!s) return null;
  return `s2o_orders_${s.tenantId}_${s.branchId}_${s.tableId}`;
}

export function getOrders(): LocalOrder[] {
  const k = keyForSession();
  if (!k) return [];
  return readJSON<LocalOrder[]>(k, []);
}

export function setOrders(orders: LocalOrder[]) {
  const k = keyForSession();
  if (!k) return;
  writeJSON(k, orders);
  emit();
}

export function addOrder(o: LocalOrder) {
  const arr = getOrders();
  setOrders([o, ...arr]);
}

export function patchOrder(orderId: string, patch: Partial<LocalOrder>) {
  const arr = getOrders().map((o) => (o.orderId === orderId ? { ...o, ...patch } : o));
  setOrders(arr);
}

export function subscribeOrders(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const on = () => cb();
  window.addEventListener(EVT, on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener(EVT, on);
    window.removeEventListener("storage", on);
  };
}
