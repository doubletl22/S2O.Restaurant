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

describe("ownerReportService.getRevenueData (Function 34 - Revenue Series Analysis)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC3401 - should normalize and sort series data for chart", async () => {
    vi.mocked(http.get).mockResolvedValue([
      { Date: "2026-04-03T09:00:00Z", Revenue: 3500000 },
      { Date: "2026-04-01T09:00:00Z", Revenue: 1500000 },
      { Date: "2026-04-02T09:00:00Z", Revenue: 2000000 },
    ]);

    const result = await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-03"),
      allTime: false,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([
      { date: "2026-04-01", revenue: 1500000 },
      { date: "2026-04-02", revenue: 2000000 },
      { date: "2026-04-03", revenue: 3500000 },
    ]);
  });

  it("UTC3402 - should include branchId param when specific branch is selected", async () => {
    vi.mocked(http.get).mockResolvedValue([
      { date: "2026-04-01", revenue: 800000 },
      { date: "2026-04-02", revenue: 900000 },
    ]);

    const result = await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-02"),
      allTime: false,
      branchId: "b-001",
    });

    expect(http.get).toHaveBeenCalledWith("/api/v1/orders/owner/revenue-series", {
      params: {
        allTime: false,
        from: "2026-04-01",
        to: "2026-04-02",
        branchId: "b-001",
      },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
  });

  it("UTC3403 - should omit branchId when branchId is 'all'", async () => {
    vi.mocked(http.get).mockResolvedValue([
      { date: "2026-04-01", revenue: 1000000 },
    ]);

    await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-01"),
      allTime: false,
      branchId: "all",
    });

    expect(http.get).toHaveBeenCalledWith("/api/v1/orders/owner/revenue-series", {
      params: {
        allTime: false,
        from: "2026-04-01",
        to: "2026-04-01",
      },
    });
  });

  it("UTC3404 - should fallback to orders endpoint and build chart points", async () => {
    vi.mocked(http.get)
      .mockRejectedValueOnce(new Error("revenue-series failed"))
      .mockResolvedValueOnce({
        value: [
          {
            id: "o1",
            status: "Completed",
            totalAmount: 1200000,
            createdAt: "2026-04-01T10:00:00Z",
          },
          {
            id: "o2",
            status: "Served",
            totalAmount: 800000,
            createdAt: "2026-04-01T15:00:00Z",
          },
          {
            id: "o3",
            status: "Cancelled",
            totalAmount: 999999,
            createdAt: "2026-04-01T16:00:00Z",
          },
          {
            id: "o4",
            status: "Completed",
            totalAmount: 500000,
            createdAt: "2026-04-02T08:00:00Z",
          },
        ],
      });

    const result = await ownerReportService.getRevenueData({
      from: new Date("2026-04-01"),
      to: new Date("2026-04-02"),
      allTime: false,
    });

    expect(http.get).toHaveBeenNthCalledWith(1, "/api/v1/orders/owner/revenue-series", {
      params: {
        allTime: false,
        from: "2026-04-01",
        to: "2026-04-02",
      },
    });
    expect(http.get).toHaveBeenNthCalledWith(2, "/api/v1/orders");

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([
      { date: "2026-04-01", revenue: 2000000 },
      { date: "2026-04-02", revenue: 500000 },
    ]);
  });

  it("UTC3405 - should reject when primary and fallback endpoints both fail", async () => {
    vi.mocked(http.get)
      .mockRejectedValueOnce(new Error("revenue-series failed"))
      .mockRejectedValueOnce(new Error("orders failed"));

    await expect(
      ownerReportService.getRevenueData({
        from: new Date("2026-04-01"),
        to: new Date("2026-04-02"),
        allTime: false,
      })
    ).rejects.toThrow("orders failed");
  });
});
