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
import { staffService } from "../../services/staff.service";

describe("staffService.getOrderDetail (Function 37 - Show Invoice Detail)", () => {
  const orderId = "2f45d2c8-ef0f-4f6e-a0bb-8f3a1e5a6671";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC3701 - should return order detail with items, quantity and unit price", async () => {
    const payload = {
      id: orderId,
      orderNumber: "INV-2026-001",
      status: "Paid",
      totalAmount: 320000,
      items: [
        { productName: "Pho Bo", quantity: 2, unitPrice: 80000, totalPrice: 160000 },
        { productName: "Tra Dao", quantity: 4, unitPrice: 40000, totalPrice: 160000 },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await staffService.getOrderDetail(orderId);

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
    expect(result).toEqual(payload);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].quantity).toBe(2);
    expect(result.items[0].unitPrice).toBe(80000);
  });

  it("UTC3702 - should return order detail when item list is empty", async () => {
    const payload = {
      id: orderId,
      orderNumber: "INV-2026-002",
      status: "Paid",
      totalAmount: 0,
      items: [],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await staffService.getOrderDetail(orderId);

    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
    expect(result.items).toEqual([]);
    expect(result.totalAmount).toBe(0);
  });

  it("UTC3703 - should reject with 404 when order id does not exist", async () => {
    const notFoundError = {
      response: {
        status: 404,
        data: {
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        },
      },
    };
    vi.mocked(http.get).mockRejectedValue(notFoundError);

    await expect(staffService.getOrderDetail(orderId)).rejects.toEqual(notFoundError);
    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
  });

  it("UTC3704 - should reject with 403 when user has no permission", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: {
          code: "FORBIDDEN",
          message: "You do not have permission to view this order",
        },
      },
    };
    vi.mocked(http.get).mockRejectedValue(forbiddenError);

    await expect(staffService.getOrderDetail(orderId)).rejects.toEqual(forbiddenError);
    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
  });

  it("UTC3705 - should reject with 400 when order id format is invalid", async () => {
    const invalidId = "invalid-order-id";
    const badRequestError = {
      response: {
        status: 400,
        data: {
          code: "INVALID_ORDER_ID",
          message: "Order ID format is invalid",
        },
      },
    };
    vi.mocked(http.get).mockRejectedValue(badRequestError);

    await expect(staffService.getOrderDetail(invalidId)).rejects.toEqual(badRequestError);
    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${invalidId}`);
  });
});
