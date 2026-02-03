"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/lib/http";
import { toast } from "sonner";

// Service gọi API
const staffService = {
  // GET
  getAll: async (branchId?: string) => {
    const params: any = {};
    if (branchId && branchId !== "ALL") {
        params.branchId = branchId;
    }
    return http.get("/api/v1/staff", { params });
  },

  // POST
  create: async (data: any) => {
    const payload = {
      email: data.email,
      password: data.password,
      fullName: data.name,
      phoneNumber: data.phoneNumber,
      branchId: data.branchId,
      role: data.role,
    };
    return http.post("/api/v1/staff", payload);
  },

  // PUT
  update: async (id: string, data: any) => {
    const payload = {
      userId: id,
      fullName: data.name,
      email: data.email, // Nếu backend cho phép sửa email
      branchId: data.branchId,
      role: data.role,
      isActive: data.isActive,
      password: data.password || null,
    };
    return http.put(`/api/v1/staff/${id}`, payload);
  },

  // [FIX ERROR 1] THÊM DELETE
  delete: async (id: string) => {
    return http.delete(`/api/v1/staff/${id}`);
  }
};

// --- HOOKS ---

export const useStaffs = (branchId?: string | null) => {
  return useQuery({
    queryKey: ["staffs", branchId],
    queryFn: async () => {
      const res: any = await staffService.getAll(branchId || undefined);
      return res.items || res || [];
    },
  });
};

export const useCreateStaff = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.create,
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công");
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Lỗi thêm nhân viên";
      toast.error(msg);
    },
  });
};

export const useUpdateStaff = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => staffService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Lỗi cập nhật";
      toast.error(msg);
    },
  });
};

// [FIX ERROR 1] XUẤT HOOK NÀY RA
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.delete,
    onSuccess: () => {
      toast.success("Đã xóa nhân viên");
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Lỗi xóa nhân viên";
      toast.error(msg);
    },
  });
};