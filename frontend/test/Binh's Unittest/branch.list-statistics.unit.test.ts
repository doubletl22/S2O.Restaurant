import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { branchService } from "../../services/branch.service";

type BranchRow = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
};

function summarizeBranches(branches: BranchRow[]) {
  const total = branches.length;
  const active = branches.filter((branch) => branch.isActive !== false).length;
  const inactive = total - active;

  return { total, active, inactive };
}

describe("branchService.getAll - List statistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC-BR-STATS-01 - should return branch list and total count", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "b1", name: "CN Q1", isActive: true },
        { id: "b2", name: "CN Q3", isActive: true },
        { id: "b3", name: "CN Q7", isActive: false },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await branchService.getAll();

    expect(http.get).toHaveBeenCalledWith("/api/v1/branches");
    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(3);
  });

  it("UTC-BR-STATS-02 - should calculate active/inactive statistics from list", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "b1", name: "CN Q1", isActive: true },
        { id: "b2", name: "CN Q3", isActive: false },
        { id: "b3", name: "CN Q7", isActive: true },
        { id: "b4", name: "CN Tan Binh", isActive: false },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await branchService.getAll();
    const stats = summarizeBranches(result.value as BranchRow[]);

    expect(stats.total).toBe(4);
    expect(stats.active).toBe(2);
    expect(stats.inactive).toBe(2);
  });

  it("UTC-BR-STATS-03 - should return zero statistics when list is empty", async () => {
    const payload = {
      isSuccess: true,
      value: [],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await branchService.getAll();
    const stats = summarizeBranches(result.value as BranchRow[]);

    expect(result.value).toEqual([]);
    expect(stats).toEqual({ total: 0, active: 0, inactive: 0 });
  });

  it("UTC-BR-STATS-04 - should treat missing isActive as active branch", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "b1", name: "CN Q1" },
        { id: "b2", name: "CN Q3", isActive: false },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await branchService.getAll();
    const stats = summarizeBranches(result.value as BranchRow[]);

    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.inactive).toBe(1);
  });

  it("UTC-BR-STATS-05 - should reject when API call fails", async () => {
    const serverError = {
      response: {
        status: 500,
        data: { message: "Internal Server Error" },
      },
    };
    vi.mocked(http.get).mockRejectedValue(serverError);

    await expect(branchService.getAll()).rejects.toEqual(serverError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/branches");
  });
});
