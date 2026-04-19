import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { adminService } from "../../services/admin.service";

describe("adminService.getStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC301 - should fetch dashboard stats successfully without date filter", async () => {
    const payload = {
      isSuccess: true,
      value: {
        totalTenants: 25,
        activeTenants: 20,
        totalRevenue: 120000000,
        totalUsers: 52,
      },
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await adminService.getStats();

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith("/api/v1/admin/stats", { params: undefined });
    expect(result).toEqual(payload);
  });

  it("UTC302 - should send from/to filter params correctly", async () => {
    const payload = {
      isSuccess: true,
      value: {
        totalTenants: 2,
        activeTenants: 1,
        totalRevenue: 2500000,
        totalUsers: 6,
      },
    };
    const params = { from: "2026-04-01", to: "2026-04-18" };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await adminService.getStats(params);

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith("/api/v1/admin/stats", { params });
    expect(result).toEqual(payload);
  });

  it("UTC303 - should pass through business failure payload (invalid date range)", async () => {
    const payload = {
      isSuccess: false,
      error: {
        code: "INVALID_DATE_RANGE",
        description: "Ngay bat dau khong duoc lon hon ngay ket thuc.",
      },
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await adminService.getStats({ from: "2026-04-20", to: "2026-04-10" });

    expect(http.get).toHaveBeenCalledWith("/api/v1/admin/stats", {
      params: { from: "2026-04-20", to: "2026-04-10" },
    });
    expect(result).toEqual(payload);
  });

  it("UTC304 - should reject when API returns unauthorized/forbidden error", async () => {
    const apiError = { response: { status: 403, data: { message: "Forbidden" } } };
    vi.mocked(http.get).mockRejectedValue(apiError);

    await expect(adminService.getStats()).rejects.toEqual(apiError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/admin/stats", { params: undefined });
  });

  it("UTC305 - should reject when server returns internal error", async () => {
    const serverError = { response: { status: 500, data: { message: "Internal Server Error" } } };
    vi.mocked(http.get).mockRejectedValue(serverError);

    await expect(adminService.getStats()).rejects.toEqual(serverError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/admin/stats", { params: undefined });
  });
});
