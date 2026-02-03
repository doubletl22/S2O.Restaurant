"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Tên món bắt buộc"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không được âm"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
});

type FormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryId?: string | null;
  productToEdit?: any; // [FIX] Thêm biến này để nhận dữ liệu cần sửa
}

export function ProductDialog({ open, onOpenChange, defaultCategoryId, productToEdit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  
  // Hook Create
  const createMutation = useCreateProduct(() => {
    onOpenChange(false);
    form.reset();
    setFile(null);
  });

  // [FIX] Hook Update (Thêm đoạn này)
  const updateMutation = useUpdateProduct(() => {
    onOpenChange(false);
    form.reset();
    setFile(null);
  });
  
  const { data: categories, isLoading: isLoadingCats } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, description: "", categoryId: "" },
  });

  // [FIX] Effect để điền dữ liệu vào form khi mở Dialog (cho cả Create và Edit)
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        // Nếu đang sửa: Điền dữ liệu cũ
        form.reset({
          name: productToEdit.name,
          price: productToEdit.price,
          description: productToEdit.description || "",
          categoryId: productToEdit.categoryId,
        });
      } else {
        // Nếu tạo mới: Reset form và gán danh mục mặc định (nếu có)
        form.reset({
          name: "",
          price: 0,
          description: "",
          categoryId: defaultCategoryId || ""
        });
      }
      setFile(null);
    }
  }, [open, defaultCategoryId, productToEdit, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      imageFile: file || undefined,
      isActive: true, 
    };

    if (productToEdit) {
      // [FIX] Logic sửa món
      updateMutation.mutate({
        id: productToEdit.id,
        data: { 
          ...payload, 
          id: productToEdit.id 
        }, 
      });
    } else {
      // Logic thêm món
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Cập nhật món ăn" : "Thêm món mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên món</FormLabel>
                  <FormControl><Input placeholder="Phở bò..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá bán (VNĐ)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCats ? "Đang tải..." : "Chọn danh mục"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea placeholder="Thành phần..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel>Hình ảnh</FormLabel>
              <div className="flex items-center gap-4 border p-3 rounded-md bg-muted/50">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
                <label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary">
                  <Upload className="h-4 w-4" />
                  {file ? "Đổi ảnh khác" : "Tải ảnh lên"}
                </label>
                {/* [FIX] Tailwind: max-w-[200px] -> max-w-xs hoặc w-48 */}
                {file && <span className="text-xs text-muted-foreground truncate w-48">{file.name}</span>}
              </div>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? "Lưu thay đổi" : "Thêm món"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}