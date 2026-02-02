"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Hoặc hook use-toast của bạn
import { Loader2, Plus, Upload } from "lucide-react";

// Schema validate
const productSchema = z.object({
  name: z.string().min(1, "Tên món không được để trống"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"), // Giả sử đã có select box category
  // Image validation xử lý riêng vì input file khó validate qua zod trực tiếp với react-hook-form native
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductDialog() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "", // Bạn cần truyền ID danh mục thực tế vào đây hoặc dùng Select
    },
  });

  // Mutation gọi API
  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // Build payload khớp với CreateProductRequest
      const payload: any = {
        ...values,
        imageFile: selectedFile, // Truyền file vào đây
      };
      
      // Nếu categoryId chưa có (ví dụ demo), hãy gán cứng hoặc xử lý logic Select
      // payload.categoryId = "GUID_CUA_CATEGORY"; 
      
      return await productService.create(payload);
    },
    onSuccess: () => {
      toast.success("Tạo món thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh list
      setOpen(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo món");
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    // Validate file thủ công nếu cần
    // if (!selectedFile) { toast.error("Vui lòng chọn ảnh"); return; }
    
    // Giả sử categoryId lấy từ form hoặc context. 
    // Demo này yêu cầu user nhập ID hoặc bạn tích hợp Select Component
    createProductMutation.mutate(values);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm món mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm món mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết món ăn và tải lên hình ảnh.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Tên món */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên món</FormLabel>
                  <FormControl>
                    <Input placeholder="Phở bò tái..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Giá & Danh mục (Demo input text cho categoryId) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VNĐ)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục (ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="Guid Category..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thơm ngon..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload File Input */}
            <FormItem>
                <FormLabel>Hình ảnh</FormLabel>
                <div className="flex items-center gap-4">
                    <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="cursor-pointer"
                    />
                    {selectedFile && (
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {selectedFile.name}
                        </div>
                    )}
                </div>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu món
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}