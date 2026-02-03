"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { branchService } from "@/services/branch.service";
import { tableService } from "@/services/table.service";

function unwrapList<T>(res: any): T[] {
  // Hỗ trợ nhiều kiểu response:
  // - { isSuccess, value }
  // - { items: [] }
  // - [] (raw)
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.value)) return res.value;
  if (res.value && Array.isArray(res.value.items)) return res.value.items;
  return [];
}

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res: any = await branchService.getAll();
      return unwrapList(res);
    },
  });
};

export const useCreateBranch = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: branchService.create,
    onSuccess: () => {
      toast.success("Thêm chi nhánh thành công");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err?.message || "Lỗi thêm chi nhánh"),
  });
};

export const useUpdateBranch = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => branchService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật chi nhánh thành công");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err?.message || "Lỗi cập nhật"),
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: branchService.delete,
    onSuccess: () => {
      toast.success("Đã xóa chi nhánh");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => toast.error("Lỗi khi xóa chi nhánh"),
  });
};

export const useTables = (branchId: string | null) => {
  return useQuery({
    queryKey: ["tables", branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const res: any = await tableService.getByBranch(branchId);
      return unwrapList(res);
    },
    enabled: !!branchId,
  });
};

export const useCreateTable = (branchId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => tableService.create(branchId, data),
    onSuccess: () => {
      toast.success("Thêm bàn thành công");
      queryClient.invalidateQueries({ queryKey: ["tables", branchId] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err?.message || "Lỗi thêm bàn"),
  });
};

export const useUpdateTable = (branchId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tableService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật bàn thành công");
      queryClient.invalidateQueries({ queryKey: ["tables", branchId] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err?.message || "Lỗi cập nhật bàn"),
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tableService.delete(id),
    onSuccess: (_: any, id: any, ctx: any) => {
      toast.success("Đã xóa bàn");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: () => toast.error("Lỗi khi xóa bàn"),
  });
};
