"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { CreateProductRequest, Product } from "@/lib/types";
import { toast } from "sonner";

export const useProducts = (params?: { keyword?: string; categoryId?: string }) => {
  return useQuery({
    queryKey: ["products", params], 
    queryFn: async () => {
      const res: any = await productService.getAll(params);

      if (res.value && res.value.items) return res.value.items;
      
      if (res.value && Array.isArray(res.value)) return res.value;

      if (Array.isArray(res)) return res;

      if (res.items) return res.items;

      return [];
    },
  });
};

// 2. Tạo món mới (Có upload ảnh)
export const useCreateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      toast.success("Thêm món thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error("Lỗi khi thêm món"),
  });
};

export const useUpdateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật món thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error("Lỗi cập nhật món"),
  });
};

// [FIX] Thêm luôn hook xóa để dùng cho nút xóa
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      toast.success("Đã xóa món ăn");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error("Không thể xóa món này"),
  });
};