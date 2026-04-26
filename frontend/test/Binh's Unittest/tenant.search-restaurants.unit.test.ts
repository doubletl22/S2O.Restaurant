import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tenantService } from "../../services/tenant.service";

describe("tenantService.getAll (Function 4 - Search Restaurants)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC401 - should return tenants list when API returns value as array", async () => {
    const payload = {
      isSuccess: true,
      statusCode: 200,
      value: [
        { id: "t1", name: "Pizza Hub" },
        { id: "t2", name: "Sushi Go" },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tenantService.getAll();

    expect(http.get).toHaveBeenCalledWith("/api/v1/tenants", {
      params: { keyword: undefined, page: 1, pageSize: 100 },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].name).toBe("Pizza Hub");
  });

  it("UTC402 - should send keyword and normalize response when API returns value.data", async () => {
    const payload = {
      isSuccess: true,
      statusCode: 200,
      value: {
        data: [{ id: "t3", name: "Pho House" }],
        page: 1,
        pageSize: 100,
        totalCount: 1,
      },
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tenantService.getAll("pho");

    expect(http.get).toHaveBeenCalledWith("/api/v1/tenants", {
      params: { keyword: "pho", page: 1, pageSize: 100 },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([{ id: "t3", name: "Pho House" }]);
  });

  it("UTC403 - should return empty array when API payload has no list", async () => {
    const payload = {
      isSuccess: true,
      statusCode: 200,
      value: null,
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tenantService.getAll("");

    expect(http.get).toHaveBeenCalledWith("/api/v1/tenants", {
      params: { keyword: "", page: 1, pageSize: 100 },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("UTC404 - should map forbidden (403) error to business result", async () => {
    const forbiddenError = {
      status: 403,
      response: { status: 403 },
    };
    vi.mocked(http.get).mockRejectedValue(forbiddenError);

    const result = await tenantService.getAll("pizza");

    expect(result.isSuccess).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error?.code).toBe("FORBIDDEN");
    expect(Array.isArray(result.value)).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("UTC405 - should rethrow non-403 errors", async () => {
    const serverError = {
      response: { status: 500, data: { message: "Internal Server Error" } },
    };
    vi.mocked(http.get).mockRejectedValue(serverError);

    await expect(tenantService.getAll("pizza")).rejects.toEqual(serverError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tenants", {
      params: { keyword: "pizza", page: 1, pageSize: 100 },
    });
  });
});
