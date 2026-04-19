import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../lib/jwt", () => ({
  getBranchId: vi.fn(() => "b-001"),
}));

import http from "../../lib/http";
import { OrderStatus } from "../../lib/types";
import { staffService } from "../../services/staff.service";

function toLocalDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getOrderCreatedAt(order: any): string {
  return String(order?.createdAtUtc || order?.createdAt || order?.createdOn || "");
}

function getPaidOrdersByDate(orders: any[], selectedDate: string) {
  const paid = orders.filter(
    (o) => o.status === OrderStatus.Served || o.status === OrderStatus.Completed
  );
  return paid.filter((o) => toLocalDateKey(getOrderCreatedAt(o)) === selectedDate);
}

describe("Function 40 - Payment history by date (using staffService.getOrders)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC4001 - should return completed/served invoices for selected date", async () => {
    vi.mocked(http.get).mockResolvedValue([
      {
        id: "o1",
        orderNumber: "INV-001",
        status: "Completed",
        totalAmount: 200000,
        createdAtUtc: "2026-04-19T09:15:00Z",
        items: [{ quantity: 2 }],
      },
      {
        id: "o2",
        orderNumber: "INV-002",
        status: "Served",
        totalAmount: 150000,
        createdAtUtc: "2026-04-19T10:30:00Z",
        items: [{ quantity: 1 }],
      },
      {
        id: "o3",
        orderNumber: "INV-003",
        status: "Cancelled",
        totalAmount: 99999,
        createdAtUtc: "2026-04-19T11:00:00Z",
        items: [{ quantity: 1 }],
      },
    ]);

    const res = await staffService.getOrders();
    const filtered = getPaidOrdersByDate(res.value, "2026-04-19");

    expect(http.get).toHaveBeenCalledWith("/api/v1/orders", { params: {} });
    expect(res.isSuccess).toBe(true);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((o) => o.orderNumber)).toEqual(["INV-001", "INV-002"]);
  });

  it("UTC4002 - should return empty list when selected date has no completed invoices", async () => {
    vi.mocked(http.get).mockResolvedValue([
      {
        id: "o4",
        orderNumber: "INV-004",
        status: "Completed",
        totalAmount: 300000,
        createdAtUtc: "2026-04-18T09:00:00Z",
        items: [{ quantity: 2 }],
      },
    ]);

    const res = await staffService.getOrders();
    const filtered = getPaidOrdersByDate(res.value, "2026-04-19");

    expect(filtered).toEqual([]);
  });

  it("UTC4003 - should reject when API returns forbidden (403)", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: { code: "FORBIDDEN", message: "No permission" },
      },
    };
    vi.mocked(http.get).mockRejectedValue(forbiddenError);

    await expect(staffService.getOrders()).rejects.toEqual(forbiddenError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/orders", { params: {} });
  });
});
