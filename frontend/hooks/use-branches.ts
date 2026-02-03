"use client";
import { useQuery } from "@tanstack/react-query";
import { branchService} from "@/services/branch.service";
import { tableService } from "@/services/table.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
        const res: any = await branchService.getAll();
        return res.items || res || [];
    }
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
        return res.items || res || [];
    },
    enabled: !!branchId // Chỉ gọi API khi đã chọn chi nhánh
  });
};

export const useCreateTable = (branchId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableService.create,
    onSuccess: () => {
      toast.success("Thêm bàn thành công");
      // Invalidate đúng query key có branchId
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
    onError: (err: any) => toast.error(err?.message || "Lỗi cập nhật"),
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableService.delete,
    onSuccess: (_, variables) => { 
       toast.success("Đã xóa bàn");
       // Invalidate tất cả query tables (hoặc tìm cách lấy branchId để tối ưu)
       queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: () => toast.error("Lỗi khi xóa bàn"),
  });
};