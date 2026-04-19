import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../services/owner-staff.service", () => ({
  ownerStaffService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../services/product.service", () => ({
  productService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../services/branch.service", () => ({
  branchService: {
    getAll: vi.fn(),
  },
}));

import http from "../../lib/http";
import { ownerReportService } from "../../services/owner-report.service";

describe("Function 42 - Branch revenue chart (single unit: ownerReportService.getRevenueData)", () => {
  const validBranchId = "b-001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC4201 - should return sorted daily revenue from revenue-series when branchId is b-001", async () => {
    vi.mocked(http.get).mockResolvedValue([
      { Date: "2026-04-03T09:00:00Z", Revenue: 3500000 },
      { Date: "2026-04-01T09:00:00Z", Revenue: 1500000 },
      { Date: "2026-04-02T09:00:00Z", Revenue: 2000000 },
    ]);

    const result = await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-03"),
      allTime: false,
      branchId: validBranchId,
    });

    expect(http.get).toHaveBeenCalledWith("/api/v1/orders/owner/revenue-series", {
      params: {
        allTime: false,
        from: "2026-04-01",
        to: "2026-04-03",
        branchId: validBranchId,
      },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([
      { date: "2026-04-01", revenue: 1500000 },
      { date: "2026-04-02", revenue: 2000000 },
      { date: "2026-04-03", revenue: 3500000 },
    ]);
  });

  it("UTC4202 - should return empty list when revenue-series is null and no fallback paid orders exist", async () => {
    vi.mocked(http.get)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        value: [],
      });

    const result = await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-03"),
      allTime: false,
      branchId: validBranchId,
    });

    expect(http.get).toHaveBeenNthCalledWith(1, "/api/v1/orders/owner/revenue-series", {
      params: {
        allTime: false,
        from: "2026-04-01",
        to: "2026-04-03",
        branchId: validBranchId,
      },
    });
    expect(http.get).toHaveBeenNthCalledWith(2, "/api/v1/orders");
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("UTC4203 - should reject with 'Chi nhanh khong ton tai' when branchId is dwadawd", async () => {
    vi.mocked(http.get)
      .mockRejectedValueOnce(new Error("Chi nhanh khong ton tai"))
      .mockRejectedValueOnce(new Error("Chi nhanh khong ton tai"));

    await expect(
      ownerReportService.getRevenueData({
        from: new Date("2026-04-01"),
        to: new Date("2026-04-03"),
        allTime: false,
        branchId: "dwadawd",
      }),
    ).rejects.toThrow("Chi nhanh khong ton tai");

    expect(http.get).toHaveBeenCalledTimes(2);
  });
});
