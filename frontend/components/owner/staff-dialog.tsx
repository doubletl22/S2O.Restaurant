"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateStaff, useUpdateStaff } from "@/hooks/use-staff";
import { useBranches } from "@/hooks/use-branches";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Lock, User, Phone, MapPin, Briefcase, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().optional(),
  name: z.string().min(1, "Họ tên bắt buộc"),
  phoneNumber: z.string().min(9, "SĐT không hợp lệ"),
  role: z.enum(["Manager", "Chef", "Waiter"], { required_error: "Chọn vai trò" }),
  branchId: z.string().min(1, "Chọn chi nhánh"),
  isActive: z.boolean().default(true),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffToEdit?: any;
  initialViewMode?: boolean; // [NEW] Prop để xác định mở lên là xem hay sửa
}

export function StaffDialog({ open, onOpenChange, staffToEdit, initialViewMode = false }: Props) {
  const { data: branches } = useBranches();
  
  // State nội bộ để chuyển đổi giữa Xem và Sửa
  const [isViewMode, setIsViewMode] = useState(initialViewMode);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "", password: "",
      name: "", phoneNumber: "", 
      role: "Waiter", branchId: "", isActive: true 
    },
  });

  const createMutation = useCreateStaff(() => onClose());
  const updateMutation = useUpdateStaff(() => onClose());

  useEffect(() => {
    if (open) {
      // Mỗi khi mở dialog, reset lại chế độ view theo prop truyền vào
      setIsViewMode(initialViewMode);

      if (staffToEdit) {
        form.reset({
          email: staffToEdit.email || "",
          password: "", 
          name: staffToEdit.fullName,
          phoneNumber: staffToEdit.phoneNumber,
          role: staffToEdit.role,
          branchId: staffToEdit.branchId,
          isActive: staffToEdit.isActive,
        });
      } else {
        const firstBranchId = branches && branches.length > 0 ? branches[0].id : "";
        form.reset({
          email: "", password: "",
          name: "", phoneNumber: "", 
          role: "Waiter", branchId: firstBranchId, isActive: true 
        });
      }
    }
  }, [open, staffToEdit, branches, form, initialViewMode]);

  const onClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!staffToEdit && !values.password) {
        form.setError("password", { message: "Mật khẩu bắt buộc khi tạo mới" });
        return;
    }
    if (staffToEdit) {
      updateMutation.mutate({ id: staffToEdit.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Title thay đổi tùy trạng thái
  const getTitle = () => {
      if (!staffToEdit) return "Thêm nhân viên mới";
      return isViewMode ? "Thông tin nhân viên" : "Cập nhật nhân viên";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-8">
            {getTitle()}
            {/* Nếu đang xem, hiển thị nút sửa nhanh ở header */}
            {isViewMode && staffToEdit && (
                <Button variant="ghost" size="sm" onClick={() => setIsViewMode(false)} className="text-primary h-8">
                    <Pencil className="w-4 h-4 mr-1"/> Sửa
                </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Disable toàn bộ fieldset nếu đang ở ViewMode */}
            <fieldset disabled={isViewMode} className="space-y-6 group-disabled:opacity-100">

                {/* --- KHỐI 1: TÀI KHOẢN --- */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Lock className="h-4 w-4" /> Thông tin đăng nhập
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    {/* Email luôn disable khi edit hoặc view */}
                                    <Input className="pl-9" {...field} disabled={!!staffToEdit} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />

                        {/* Ẩn mật khẩu khi đang xem để đỡ rối */}
                        {!isViewMode && (
                            <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu {staffToEdit && "(Để trống nếu không đổi)"}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />
                        )}
                    </div>
                </div>

                <Separator />

                {/* --- KHỐI 2: THÔNG TIN CÁ NHÂN --- */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <User className="h-4 w-4" /> Thông tin chi tiết
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />

                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vai trò</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                                <FormControl>
                                    <div className="relative">
                                        <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                        <SelectTrigger className="pl-9"><SelectValue /></SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Manager">Quản lý</SelectItem>
                                    <SelectItem value="Chef">Bếp</SelectItem>
                                    <SelectItem value="Waiter">Phục vụ</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )} />

                        <FormField control={form.control} name="branchId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chi nhánh</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                        <SelectTrigger className="pl-9"><SelectValue /></SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    {branches?.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                </div>

                {staffToEdit && (
                    <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                        <div className="space-y-0.5">
                            <FormLabel>Trạng thái hoạt động</FormLabel>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isViewMode} />
                        </FormControl>
                    </FormItem>
                    )} />
                )}
            </fieldset>

            <DialogFooter>
              {isViewMode ? (
                  <Button type="button" onClick={() => setIsViewMode(false)}>
                    <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                  </Button>
              ) : (
                  <>
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                  </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}