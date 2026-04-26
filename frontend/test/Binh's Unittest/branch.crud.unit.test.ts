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
import { branchService } from "../../services/branch.service";

describe("branchService CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTC-BR-01 - should call GET /api/v1/branches", async () => {
    const payload = {
      isSuccess: true,
      value: [{ id: "b-001", name: "Branch 1" }],
    };
    vi.mocked(http.get).mockResolvedValue(payload);

    const result = await branchService.getAll();

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith("/api/v1/branches");
    expect(result).toEqual(payload);
  });

  it("UTC-BR-02 - should call POST /api/v1/branches with payload", async () => {
    const body = {
      name: "Branch New",
      address: "123 Nguyen Hue",
      phone: "0909000111",
    };
    const payload = { isSuccess: true, value: "new-id" };
    vi.mocked(http.post).mockResolvedValue(payload);

    const result = await branchService.create(body);

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith("/api/v1/branches", body);
    expect(result).toEqual(payload);
  });

  it("UTC-BR-03 - should call PUT /api/v1/branches/:id with payload", async () => {
    const branchId = "b-001";
    const body = {
      name: "Branch Updated",
      address: "456 Le Loi",
      phone: "0909555666",
    };
    const payload = { isSuccess: true };
    vi.mocked(http.put).mockResolvedValue(payload);

    const result = await branchService.update(branchId, body);

    expect(http.put).toHaveBeenCalledTimes(1);
    expect(http.put).toHaveBeenCalledWith(`/api/v1/branches/${branchId}`, body);
    expect(result).toEqual(payload);
  });

  it("UTC-BR-04 - should call DELETE /api/v1/branches/:id", async () => {
    const branchId = "b-001";
    const payload = { isSuccess: true };
    vi.mocked(http.delete).mockResolvedValue(payload);

    const result = await branchService.delete(branchId);

    expect(http.delete).toHaveBeenCalledTimes(1);
    expect(http.delete).toHaveBeenCalledWith(`/api/v1/branches/${branchId}`);
    expect(result).toEqual(payload);
  });

  it("UTC-BR-05 - should reject when server returns 400 on create", async () => {
    const body = {
      name: "",
      address: "Invalid",
      phone: "0909000111",
    };
    const badRequestError = {
      response: {
        status: 400,
        data: {
          code: "VALIDATION_ERROR",
          message: "Tên chi nhánh bắt buộc",
        },
      },
    };

    vi.mocked(http.post).mockRejectedValue(badRequestError);

    await expect(branchService.create(body)).rejects.toEqual(badRequestError);
    expect(http.post).toHaveBeenCalledWith("/api/v1/branches", body);
  });
});
