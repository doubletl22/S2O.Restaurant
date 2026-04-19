import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    patch: vi.fn(),
  },
}));

vi.mock("../../lib/jwt", () => ({
  getBranchId: vi.fn(),
}));

import http from "../../lib/http";
import { getBranchId } from "../../lib/jwt";
import { OrderStatus } from "../../lib/types";
import { staffService } from "../../services/staff.service";

describe("staffService.updateOrderStatus (Function 39 - Confirm Paid/Completed)", () => {
  const orderId = "8f95d3d0-f2a8-4f6f-b2e2-96a56a73d225";
  const branchId = "4f8cdb0a-0a5b-47cf-b575-7f20d2cd45c1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBranchId).mockReturnValue(branchId);
  });

  it("UTC3901 - should update order status to Completed successfully", async () => {
    const payload = {
      isSuccess: true,
      statusCode: 200,
      value: {
        orderId,
        oldStatus: OrderStatus.Ready,
        newStatus: OrderStatus.Completed,
      },
    };
    vi.mocked(http.patch).mockResolvedValue(payload);

    const result = await staffService.updateOrderStatus(orderId, OrderStatus.Completed);

    expect(http.patch).toHaveBeenCalledTimes(1);
    expect(http.patch).toHaveBeenCalledWith(`/api/v1/orders/${orderId}/status`, {
      OrderId: orderId,
      NewStatus: OrderStatus.Completed,
      CurrentBranchId: branchId,
    });
    expect(result).toEqual(payload);
  });

  it("UTC3902 - should reject when order is already paid/completed", async () => {
    const conflictError = {
      response: {
        status: 400,
        data: {
          code: "ORDER_ALREADY_COMPLETED",
          message: "Order is already completed",
        },
      },
    };
    vi.mocked(http.patch).mockRejectedValue(conflictError);

    await expect(staffService.updateOrderStatus(orderId, OrderStatus.Completed)).rejects.toEqual(conflictError);
    expect(http.patch).toHaveBeenCalledWith(`/api/v1/orders/${orderId}/status`, {
      OrderId: orderId,
      NewStatus: OrderStatus.Completed,
      CurrentBranchId: branchId,
    });
  });

  it("UTC3903 - should throw when branch id cannot be resolved from token", async () => {
    vi.mocked(getBranchId).mockReturnValue("");

    await expect(staffService.updateOrderStatus(orderId, OrderStatus.Completed)).rejects.toThrow(
      "Không xác định được chi nhánh của bạn"
    );
    expect(http.patch).not.toHaveBeenCalled();
  });

  it("UTC3904 - should reject with 404 when order id does not exist", async () => {
    const notFoundError = {
      response: {
        status: 404,
        data: {
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        },
      },
    };
    vi.mocked(http.patch).mockRejectedValue(notFoundError);

    await expect(staffService.updateOrderStatus(orderId, OrderStatus.Completed)).rejects.toEqual(notFoundError);
    expect(http.patch).toHaveBeenCalledWith(`/api/v1/orders/${orderId}/status`, {
      OrderId: orderId,
      NewStatus: OrderStatus.Completed,
      CurrentBranchId: branchId,
    });
  });

  it("UTC3905 - should reject with 403 when cashier has no permission", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this order status",
        },
      },
    };
    vi.mocked(http.patch).mockRejectedValue(forbiddenError);

    await expect(staffService.updateOrderStatus(orderId, OrderStatus.Completed)).rejects.toEqual(forbiddenError);
    expect(http.patch).toHaveBeenCalledWith(`/api/v1/orders/${orderId}/status`, {
      OrderId: orderId,
      NewStatus: OrderStatus.Completed,
      CurrentBranchId: branchId,
    });
  });
});
