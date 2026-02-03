import http from "@/lib/http";
import { Branch, Result } from "@/lib/types";

/**
 * Backend của bạn:
 * - GET /api/v1/branches trả về Branch[] (không bọc Result)
 * - POST/PUT có thể trả Result (tùy handler)
 *
 * => normalize để frontend luôn nhận Result<...>
 */

function ok<T>(value: T): Result<T> {
  return { isSuccess: true, value } as any;
}

function fail<T>(message = "Request failed"): Result<T> {
  return {
    isSuccess: false,
    value: null as any,
    error: { code: "ERROR", message, description: message } as any,
  } as any;
}

export const branchService = {
  // GET: /api/v1/branches  -> backend trả Branch[]
  getAll: async (): Promise<Result<Branch[]>> => {
    try {
      const res: any = await http.get("/api/v1/branches");

      // Nếu backend trả đúng Result
      if (res && typeof res === "object" && "isSuccess" in res && "value" in res) {
        return res as Result<Branch[]>;
      }

      // Nếu backend trả array Branch[]
      if (Array.isArray(res)) {
        return ok(res as Branch[]);
      }

      // Trường hợp lạ
      return ok([]);
    } catch (e: any) {
      return fail<Branch[]>(e?.message || "Không lấy được danh sách chi nhánh");
    }
  },

  // POST: /api/v1/branches
  create: async (body: { name: string; address: string; phone: string }): Promise<Result<string>> => {
    try {
      const res: any = await http.post("/api/v1/branches", body);

      // nếu backend trả Result<string>
      if (res && typeof res === "object" && "isSuccess" in res) return res;

      // nếu backend trả string/id trực tiếp
      return ok(String(res));
    } catch (e: any) {
      return fail<string>(e?.message || "Tạo chi nhánh thất bại");
    }
  },

  update: async (id: string, body: any): Promise<Result<void>> => {
    try {
      const res: any = await http.put(`/api/v1/branches/${id}`, body);

      if (res && typeof res === "object" && "isSuccess" in res) return res;

      return ok(undefined);
    } catch (e: any) {
      return fail<void>(e?.message || "Cập nhật chi nhánh thất bại");
    }
  },

  delete: async (id: string): Promise<Result<void>> => {
    try {
      const res: any = await http.delete(`/api/v1/branches/${id}`);

      if (res && typeof res === "object" && "isSuccess" in res) return res;

      return ok(undefined);
    } catch (e: any) {
      return fail<void>(e?.message || "Xóa chi nhánh thất bại");
    }
  },

  // Alias (tương thích code cũ)
  getBranches: async () => branchService.getAll(),
  createBranch: async (b: any) => branchService.create(b),
  updateBranch: async (id: string, b: any) => branchService.update(id, b),
  deleteBranch: async (id: string) => branchService.delete(id),
};
