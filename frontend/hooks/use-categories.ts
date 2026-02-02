"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";

// 1. Lấy danh sách
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (!res.isSuccess) throw new Error(res.error?.description || "Lỗi lấy danh mục");
      return res.value; 
    },
  });
};

// 2. Tạo mới (Fix lỗi missing hook)
export const useCreateCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      toast.success("Tạo danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Lỗi tạo danh mục"),
  });
};

// 3. Cập nhật
export const useUpdateCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error("Lỗi cập nhật danh mục"),
  });
};

// 4. Xóa (Fix lỗi useDeleteCategory not exported)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      toast.success("Đã xóa danh mục");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error("Không thể xóa danh mục này"),
  });
};

