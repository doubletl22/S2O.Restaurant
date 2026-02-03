"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Tên chi nhánh bắt buộc"),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchToEdit?: any; // Dữ liệu chi nhánh cần sửa
}

export function BranchDialog({ open, onOpenChange, branchToEdit }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", address: "", phone: "", isActive: true },
  });

  const createMutation = useCreateBranch(() => onClose());
  const updateMutation = useUpdateBranch(() => onClose());

  useEffect(() => {
    if (open) {
      if (branchToEdit) {
        form.reset({
          name: branchToEdit.name,
          address: branchToEdit.address || "",
          phone: branchToEdit.phone || "",
          isActive: branchToEdit.isActive,
        });
      } else {
        form.reset({ name: "", address: "", phone: "", isActive: true });
      }
    }
  }, [open, branchToEdit, form]);

  const onClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // [FIX] Chuyển đổi undefined thành chuỗi rỗng "" để khớp type
    const payload = {
      ...values,
      address: values.address || "", 
      phone: values.phone || "",
    };

    if (branchToEdit) {
      updateMutation.mutate({ 
        id: branchToEdit.id, 
        data: { ...payload, id: branchToEdit.id } 
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{branchToEdit ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên chi nhánh</FormLabel>
                <FormControl><Input placeholder="VD: Chi nhánh Quận 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl><Input placeholder="Số 123 đường ABC..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl><Input placeholder="0909..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {branchToEdit ? "Lưu thay đổi" : "Tạo chi nhánh"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}