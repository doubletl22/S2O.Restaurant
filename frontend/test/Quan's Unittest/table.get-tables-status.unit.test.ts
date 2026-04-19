import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tableService } from "../../services/table.service";

describe("tableService.getTables (Function 38 - Display tables and status)", () => {
  const branchId = "b-001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC3801 - should return table layout with occupied/available status for a valid branch", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "t1", name: "A1", capacity: 4, branchId, isOccupied: false, isActive: true },
        { id: "t2", name: "A2", capacity: 6, branchId, isOccupied: true, isActive: true },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getTables(branchId);

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
    expect(result).toEqual(payload);
    expect(result.value[0].isOccupied).toBe(false);
    expect(result.value[1].isOccupied).toBe(true);
  });

  it("UTC3802 - should load all tables when branchId is null", async () => {
    const payload = {
      isSuccess: true,
      value: [
        { id: "t3", name: "B1", capacity: 2, branchId: "b-002", isOccupied: false, isActive: true },
      ],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getTables(null);

    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: undefined,
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(1);
  });

  it("UTC3803 - should return empty list when branch has no tables", async () => {
    const payload = {
      isSuccess: true,
      value: [],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getTables(branchId);

    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("UTC3804 - should reject with 403 when user has no permission", async () => {
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

    await expect(tableService.getTables(branchId)).rejects.toEqual(forbiddenError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
  });

  it("UTC3805 - should reject with 400 when branchId format is invalid", async () => {
    const invalidBranchId = "invalid-branch-id";
    const badRequestError = {
      response: {
        status: 400,
        data: {
          code: "INVALID_BRANCH_ID",
          message: "Branch ID format is invalid",
        },
      },
    };
    vi.mocked(http.get).mockRejectedValue(badRequestError);

    await expect(tableService.getTables(invalidBranchId)).rejects.toEqual(badRequestError);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId: invalidBranchId },
    });
  });
});
