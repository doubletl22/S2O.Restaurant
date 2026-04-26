import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import http from "../../lib/http";
import { tableService } from "../../services/table.service";

describe("tableService CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC-TB-01 - should call GET /api/v1/tables with branchId", async () => {
    const branchId = "b-001";
    const payload = {
      isSuccess: true,
      value: [{ id: "t-001", name: "A1", branchId }],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await tableService.getByBranch(branchId);

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith("/api/v1/tables", {
      params: { branchId },
    });
    expect(result).toEqual(payload);
  });

  it("UTC-TB-02 - should call POST /api/v1/tables with payload", async () => {
    const body = {
      name: "A2",
      capacity: 4,
      branchId: "b-001",
      isActive: true,
      isOccupied: false,
    };
    const payload = { isSuccess: true, value: "new-table-id" };
    vi.mocked(http.post).mockResolvedValue(payload);

    const result = await tableService.create(body);

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith("/api/v1/tables", body);
    expect(result).toEqual(payload);
  });

  it("UTC-TB-03 - should call PUT /api/v1/tables/:id with payload", async () => {
    const tableId = "t-001";
    const body = {
      name: "A2-Updated",
      capacity: 6,
      isActive: true,
      isOccupied: true,
      branchId: "b-001",
    };
    const payload = { isSuccess: true };
    vi.mocked(http.put).mockResolvedValue(payload);

    const result = await tableService.update(tableId, body);

    expect(http.put).toHaveBeenCalledTimes(1);
    expect(http.put).toHaveBeenCalledWith(`/api/v1/tables/${tableId}`, body);
    expect(result).toEqual(payload);
  });

  it("UTC-TB-04 - should call DELETE /api/v1/tables/:id", async () => {
    const tableId = "t-001";
    const payload = { isSuccess: true };
    vi.mocked(http.delete).mockResolvedValue(payload);

    const result = await tableService.delete(tableId);

    expect(http.delete).toHaveBeenCalledTimes(1);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/tables/${tableId}`);
    expect(result).toEqual(payload);
  });

  it("UTC-TB-05 - should reject when server returns 400 on create", async () => {
    const body = {
      name: "",
      capacity: 0,
      branchId: "b-001",
      isActive: true,
      isOccupied: false,
    };
    const badRequestError = {
      response: {
        status: 400,
        data: {
          code: "VALIDATION_ERROR",
          message: "Tên bàn bắt buộc",
        },
      },
    };

    vi.mocked(http.post).mockRejectedValue(badRequestError);

    await expect(tableService.create(body)).rejects.toEqual(badRequestError);
    expect(http.post).toHaveBeenCalledWith("/api/v1/tables", body);
  });
});
