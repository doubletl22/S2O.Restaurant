"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

import { Category } from "@/lib/types";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSuccess: () => void;
}

// Định nghĩa kiểu dữ liệu form local
interface CategoryFormValues {
  name: string;
  description: string;
  isActive: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryDialogProps) {
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onClose = () => {
    onOpenChange(false);
    onSuccess();
    form.reset();
  };

  const createMutation = useCreateCategory(onClose);
  const updateMutation = useUpdateCategory(onClose);

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        form.reset({
          name: categoryToEdit.name,
          description: categoryToEdit.description || "",
          isActive: categoryToEdit.isActive,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, categoryToEdit, form]);

  const onSubmit = (data: CategoryFormValues) => {
    const normalizedName = data.name.trim();

    if (categoryToEdit) {
      updateMutation.mutate({
        id: categoryToEdit.id,
        data: { ...data, name: normalizedName, id: categoryToEdit.id },
      });
    } else {
      createMutation.mutate({
        name: normalizedName,
        description: data.description,
        isActive: true,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? "Cập nhật danh mục" : "Tạo danh mục mới"}</DialogTitle>
          <DialogDescription>
            Phân loại thực đơn giúp khách hàng dễ dàng tìm kiếm món ăn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Tên danh mục */}
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Tên danh mục là bắt buộc",
                validate: (value) => value.trim().length > 0 || "Tên danh mục là bắt buộc",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Đồ uống, Món chính..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú thêm về nhóm món này..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trạng thái (Chỉ hiện khi Edit) */}
            {categoryToEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Kích hoạt</FormLabel>
                      <div className="text-[12px] text-muted-foreground">
                        Hiển thị danh mục này trên thực đơn khách hàng.
                      </div>
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
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {categoryToEdit ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}