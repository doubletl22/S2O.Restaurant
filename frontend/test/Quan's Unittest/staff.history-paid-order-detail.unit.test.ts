import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { staffService } from "../../services/staff.service";

describe("Function 41 - View paid invoice detail in history (OrdersController.GetOrderDetail)", () => {
  const orderId = "a8f31b95-8bde-4956-8900-0f96e46a3927";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC4101 - should return full detail for an existing paid invoice", async () => {
    const payload = {
      id: orderId,
      orderNumber: "INV-2026-041",
      status: "Paid",
      totalAmount: 260000,
      items: [
        { id: "i-1", productName: "Com tam", quantity: 2, unitPrice: 80000 },
        { id: "i-2", productName: "Tra tac", quantity: 2, unitPrice: 50000 },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await staffService.getOrderDetail(orderId);

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
    expect(result.status).toBe("Paid");
    expect(result.items).toHaveLength(2);
    expect(result.totalAmount).toBe(260000);
  });

  it("UTC4102 - should return detail with empty items for a paid invoice", async () => {
    const payload = {
      id: orderId,
      orderNumber: "INV-2026-042",
      status: "Paid",
      totalAmount: 0,
      items: [],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await staffService.getOrderDetail(orderId);

    expect(http.get).toHaveBeenCalledWith(`/api/v1/orders/${orderId}`);
    expect(result.status).toBe("Paid");
    expect(result.items).toEqual([]);
    expect(result.totalAmount).toBe(0);
  });

  it("UTC4103 - should reject when user has no permission to view paid invoice detail", async () => {
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
});
