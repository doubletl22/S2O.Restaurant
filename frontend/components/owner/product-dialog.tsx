"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProduct } from "@/hooks/use-products";
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

// Schema Validation
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
}

export function ProductDialog({ open, onOpenChange, defaultCategoryId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  
  // Hooks
  const createMutation = useCreateProduct(() => {
    onOpenChange(false);
    form.reset();
    setFile(null);
  });
  
  // Lấy danh sách danh mục để đổ vào Select
  const { data: categories, isLoading: isLoadingCats } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, description: "", categoryId: defaultCategoryId || "" },
  });

  const onSubmit = (values: FormValues) => {
    // Gọi API qua Hook
    createMutation.mutate({
      ...values,
      imageFile: file || undefined,
      isActive: true, // [FIX] Đặt mặc định là đang hoạt động
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm món mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Tên & Giá */}
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

            {/* Danh mục (Select Dynamic) */}
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Mô tả */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea placeholder="Thành phần..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Upload File */}
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
                {file && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{file.name}</span>}
              </div>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu món
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}