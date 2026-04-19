import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tenantService } from "../../services/tenant.service";

describe("tenantService.toggleLock (Function 6 - Lock/Unlock Restaurant)", () => {
  const tenantId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC601 - should lock tenant with full payload (temporary lock)", async () => {
    const payload = { reason: "Bao tri he thong", lockDurationDays: 7, isPermanent: false };
    const apiResult = { isSuccess: true, statusCode: 200 };
    vi.mocked(http.post).mockResolvedValue(apiResult);

    const result = await tenantService.toggleLock(tenantId, true, payload);

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/lock`, {
      reason: "Bao tri he thong",
      lockDurationDays: 7,
      isPermanent: false,
    });
    expect(result).toEqual(apiResult);
  });

  it("UTC602 - should lock tenant with default values when payload is missing", async () => {
    const apiResult = { isSuccess: true, statusCode: 200 };
    vi.mocked(http.post).mockResolvedValue(apiResult);

    const result = await tenantService.toggleLock(tenantId, true);

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/lock`, {
      reason: "",
      lockDurationDays: 0,
      isPermanent: false,
    });
    expect(result).toEqual(apiResult);
  });

  it("UTC603 - should unlock tenant and send empty body", async () => {
    const apiResult = { isSuccess: true, statusCode: 200 };
    vi.mocked(http.post).mockResolvedValue(apiResult);

    const result = await tenantService.toggleLock(tenantId, false, {
      reason: "payload should be ignored on unlock",
      lockDurationDays: 30,
      isPermanent: true,
    });

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/unlock`, {});
    expect(result).toEqual(apiResult);
  });

  it("UTC604 - should reject when backend returns bad request (400)", async () => {
    const badRequestError = {
      response: {
        status: 400,
        data: { code: "TENANT_NOT_FOUND", message: "Tenant does not exist" },
      },
    };
    vi.mocked(http.post).mockRejectedValue(badRequestError);

    await expect(
      tenantService.toggleLock(tenantId, true, { reason: "Invalid tenant", lockDurationDays: 1 })
    ).rejects.toEqual(badRequestError);

    expect(http.post).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/lock`, {
      reason: "Invalid tenant",
      lockDurationDays: 1,
      isPermanent: false,
    });
  });

  it("UTC605 - should reject when backend returns forbidden (403)", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: { code: "FORBIDDEN", message: "Only SystemAdmin can lock tenant" },
      },
    };
    vi.mocked(http.post).mockRejectedValue(forbiddenError);

    await expect(
      tenantService.toggleLock(tenantId, true, { reason: "Try without role", isPermanent: true })
    ).rejects.toEqual(forbiddenError);

    expect(http.post).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/lock`, {
      reason: "Try without role",
      lockDurationDays: 0,
      isPermanent: true,
    });
  });
});
