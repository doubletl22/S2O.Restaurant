"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTable, useUpdateTable } from "@/hooks/use-branches";
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
  name: z.string().min(1, "Tên bàn bắt buộc"),
  capacity: z.coerce.number().min(1, "Sức chứa tối thiểu là 1"),
  // status: z.string().optional(), // Nếu muốn chỉnh status luôn ở đây
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableToEdit?: any;
  branchId: string | null; // Cần ID chi nhánh để biết thêm vào đâu
}

export function TableDialog({ open, onOpenChange, tableToEdit, branchId }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", capacity: 4 },
  });

  // Truyền branchId vào hook để nó biết invalidateQuery nào khi xong
  const createMutation = useCreateTable(branchId || "", () => onClose());
  const updateMutation = useUpdateTable(branchId || "", () => onClose());

  useEffect(() => {
    if (open) {
      if (tableToEdit) {
        form.reset({
          name: tableToEdit.name,
          capacity: tableToEdit.capacity,
        });
      } else {
        // Tự động gợi ý tên bàn tiếp theo? (Optional)
        form.reset({ name: "", capacity: 4 });
      }
    }
  }, [open, tableToEdit, form]);

  const onClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!branchId) return; // Safety check

    const payload = {
        ...values,
        branchId: branchId // Luôn gửi kèm branchId
    };

    if (tableToEdit) {
      updateMutation.mutate({ 
          id: tableToEdit.id, 
          data: { ...payload, id: tableToEdit.id } 
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>{tableToEdit ? "Cập nhật bàn" : "Thêm bàn mới"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên bàn</FormLabel>
                <FormControl><Input placeholder="Bàn 01, VIP 2..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem>
                <FormLabel>Số ghế (Capacity)</FormLabel>
                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tableToEdit ? "Lưu" : "Thêm bàn"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}