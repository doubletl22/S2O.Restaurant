// Frontend_Sumary/components/owner/product-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";

import { Product, CreateProductRequest } from "@/lib/types";
import { productService } from "@/services/product.service";

// Schema khớp với CreateProductRequest
const formSchema = z.object({
  name: z.string().min(1, "Tên món không được để trống"),
  price: z.coerce.number().min(0, "Giá phải lớn hơn 0"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(), // Đổi từ 'image' sang 'imageUrl'
});

interface ProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: () => void;
  categories: { id: string; name: string }[];
}

export function ProductDialog({
  open,
  setOpen,
  product,
  onSuccess,
  categories,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);

  // Khai báo form với đúng Type
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      isActive: true,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        description: product.description || "",
        categoryId: product.categoryId,
        isActive: product.isActive,
        imageUrl: product.imageUrl || "",
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        description: "",
        categoryId: "",
        isActive: true,
        imageUrl: "",
      });
    }
  }, [product, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      const payload: CreateProductRequest = {
        name: values.name,
        price: values.price,
        description: values.description,
        categoryId: values.categoryId,
        isActive: values.isActive,
        imageUrl: values.imageUrl,
      };

      if (product) {
        // Gọi updateProduct
        await productService.updateProduct(product.id, payload);
        toast.success("Cập nhật thành công");
      } else {
        // Gọi createProduct
        await productService.createProduct(payload);
        toast.success("Thêm món mới thành công");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.description || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Sửa món ăn" : "Thêm món ăn"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên món</FormLabel>
                  <FormControl>
                    <Input placeholder="Phở bò..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán</FormLabel>
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
                    <FormLabel>Danh mục</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        {...field}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Hình ảnh</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Kích hoạt</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
               <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}