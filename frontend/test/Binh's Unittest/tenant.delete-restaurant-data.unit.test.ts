import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    delete: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tenantService } from "../../services/tenant.service";

describe("tenantService.delete (Function 7 - Delete Tenant Data)", () => {
  const tenantId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC701 - should delete tenant successfully when tenant id exists", async () => {
    const apiResult = {
      isSuccess: true,
      statusCode: 200,
      value: null,
    };
    vi.mocked(http.delete).mockResolvedValue(apiResult);

    const result = await tenantService.delete(tenantId);

    expect(http.delete).toHaveBeenCalledTimes(1);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}`);
    expect(result).toEqual(apiResult);
  });

  it("UTC702 - should pass through success payload after cleanup cascade", async () => {
    const apiResult = {
      isSuccess: true,
      statusCode: 200,
      message: "Tenant and related data were deleted successfully",
      value: null,
    };
    vi.mocked(http.delete).mockResolvedValue(apiResult);

    const result = await tenantService.delete(tenantId);

    expect(http.delete).toHaveBeenCalledTimes(1);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}`);
    expect(result).toEqual(apiResult);
  });

  it("UTC703 - should reject with 404 when tenant does not exist", async () => {
    const notFoundError = {
      response: {
        status: 404,
        data: {
          code: "TENANT_NOT_FOUND",
          message: "Tenant not found",
        },
      },
    };
    vi.mocked(http.delete).mockRejectedValue(notFoundError);

    await expect(tenantService.delete(tenantId)).rejects.toEqual(notFoundError);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}`);
  });

  it("UTC704 - should reject with 403 when user is not SystemAdmin", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: {
          code: "FORBIDDEN",
          message: "Only SystemAdmin can delete tenant",
        },
      },
    };
    vi.mocked(http.delete).mockRejectedValue(forbiddenError);

    await expect(tenantService.delete(tenantId)).rejects.toEqual(forbiddenError);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}`);
  });

  it("UTC705 - should reject with 502 when cross-service cleanup fails", async () => {
    const badGatewayError = {
      response: {
        status: 502,
        data: {
          message: "Xoa du lieu lien service that bai",
          service: "Order",
          details: "HTTP 500: timeout",
        },
      },
    };
    vi.mocked(http.delete).mockRejectedValue(badGatewayError);

    await expect(tenantService.delete(tenantId)).rejects.toEqual(badGatewayError);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}`);
  });
});
