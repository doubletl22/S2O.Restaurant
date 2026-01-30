"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Category, Product, CreateProductRequest } from "@/lib/types";
import { productService } from "@/services/product.service";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  productToEdit,
  categories,
  onSuccess,
}: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Khởi tạo Form với Type chuẩn
  const form = useForm<CreateProductRequest>({
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      image: undefined, // Dùng undefined thay vì null cho File input ban đầu
      isActive: true,
    },
  });

  // Effect: Reset form khi mở dialog hoặc thay đổi mode (Edit/Create)
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        // Mode Edit: Fill dữ liệu
        form.reset({
          name: productToEdit.name,
          price: productToEdit.price,
          description: productToEdit.description || "",
          categoryId: productToEdit.categoryId,
          isActive: productToEdit.isActive,
          image: undefined, // Không set file cũ vào input file được
        });
        setPreviewImage(productToEdit.imageUrl || null);
      } else {
        // Mode Create: Reset trắng
        form.reset({
          name: "",
          price: 0,
          description: "",
          categoryId: "",
          isActive: true,
          image: undefined,
        });
        setPreviewImage(null);
      }
    }
  }, [open, productToEdit, form]);

  // Handle chọn ảnh thủ công
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file); // Cập nhật vào state của react-hook-form
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreateProductRequest) => {
    setIsLoading(true);
    try {
      let res;
      if (productToEdit) {
        // Khi update, ta giữ nguyên isActive của form (hoặc backend tự xử lý)
        // và merge với id của productToEdit
        res = await productService.update(productToEdit.id, data);
        if (res.isSuccess) toast.success("Cập nhật món ăn thành công");
      } else {
        res = await productService.create(data);
        if (res.isSuccess) toast.success("Thêm món mới thành công");
      }

      if (res.isSuccess) {
        onSuccess();
        onOpenChange(false);
      } else {
         // Fallback error toast (thường interceptor đã lo)
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Cập nhật món ăn" : "Thêm món mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin món ăn bên dưới.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Tên món */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Tên món là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên món <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Phở bò" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Giá */}
              <FormField
                control={form.control}
                name="price"
                rules={{ required: "Giá là bắt buộc", min: { value: 0, message: "Giá >= 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VNĐ) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Danh mục */}
              <FormField
                control={form.control}
                name="categoryId"
                rules={{ required: "Chọn danh mục" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Textarea placeholder="Thành phần, ghi chú..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ảnh - Fix type input file */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {previewImage ? (
                        <div className="relative h-20 w-20 rounded-md border overflow-hidden shrink-0">
                          <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              onChange(null);
                            }}
                            className="absolute top-0 right-0 bg-black/60 text-white p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center bg-muted text-muted-foreground shrink-0">
                          <Upload className="h-6 w-6" />
                        </div>
                      )}
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => handleImageChange(e, onChange)}
                        // Quan trọng: Không set value cho input file để tránh lỗi controlled/uncontrolled
                        value={undefined} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? "Lưu thay đổi" : "Tạo món mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}