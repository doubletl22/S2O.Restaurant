"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { CreateProductRequest, Product } from "@/lib/types";
import { toast } from "sonner";

export const useProducts = (params?: { keyword?: string; categoryId?: string }) => {
  return useQuery({
    queryKey: ["products", params], 
    queryFn: async () => {
      const res = await productService.getAll(params);
      if (!res.isSuccess) throw new Error(res.error?.description);
      return res.value;
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

// 3. Xóa món
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

// 4. Cập nhật món (TODO: Cần backend hỗ trợ PUT multipart nếu muốn update ảnh)