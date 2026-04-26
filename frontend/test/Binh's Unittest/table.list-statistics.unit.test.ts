import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tableService } from "../../services/table.service";

type TableRow = {
  id: string;
  name: string;
  isActive?: boolean;
  isOccupied?: boolean;
};

function summarizeTables(tables: TableRow[]) {
  const total = tables.length;
  const occupied = tables.filter((table) => table.isActive !== false && table.isOccupied === true).length;
  const empty = tables.filter((table) => table.isActive !== false && table.isOccupied !== true).length;
  const inactive = tables.filter((table) => table.isActive === false).length;

  return { total, occupied, empty, inactive };
}

describe("tableService.getByBranch - List statistics", () => {
  const branchId = "b-001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC-TB-STATS-01 - should return table list for selected branch", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "t1", name: "A1", isActive: true, isOccupied: false },
        { id: "t2", name: "A2", isActive: true, isOccupied: true },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getByBranch(branchId);

    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
    expect(result.value).toHaveLength(2);
  });

  it("UTC-TB-STATS-02 - should calculate occupied/empty/inactive statistics", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "t1", name: "A1", isActive: true, isOccupied: false },
        { id: "t2", name: "A2", isActive: true, isOccupied: true },
        { id: "t3", name: "A3", isActive: false, isOccupied: false },
        { id: "t4", name: "A4", isActive: true, isOccupied: true },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getByBranch(branchId);
    const stats = summarizeTables(result.value as TableRow[]);

    expect(stats.total).toBe(4);
    expect(stats.occupied).toBe(2);
    expect(stats.empty).toBe(1);
    expect(stats.inactive).toBe(1);
  });

  it("UTC-TB-STATS-03 - should return zero statistics when branch has no table", async () => {
    const payload = {
      isSuccess: true,
      value: [],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getByBranch(branchId);
    const stats = summarizeTables(result.value as TableRow[]);

    expect(result.value).toEqual([]);
    expect(stats).toEqual({ total: 0, occupied: 0, empty: 0, inactive: 0 });
  });

  it("UTC-TB-STATS-04 - should request all tables when branchId is null", async () => {
    const payload = {
      isSuccess: true,
      value: [{ id: "t9", name: "Global-1", isActive: true, isOccupied: false }],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getByBranch(null);

    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: undefined,
    });
    expect(result.value).toHaveLength(1);
  });

  it("UTC-TB-STATS-05 - should reject when API call fails", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: {
          code: "FORBIDDEN",
          message: "You do not have permission to access tables",
        },
      },
    };
    vi.mocked(http.get).mockRejectedValue(forbiddenError);

    await expect(tableService.getByBranch(branchId)).rejects.toEqual(forbiddenError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
  });
});
