"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Branch, CreateStaffRequest } from "@/lib/types";
import { ownerStaffService } from "@/services/owner-staff.service";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  onSuccess: () => void;
}

export function StaffDialog({
  open,
  onOpenChange,
  branches,
  onSuccess,
}: StaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateStaffRequest>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      branchId: "",
      role: "Staff", // Default role
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: CreateStaffRequest) => {
    setIsLoading(true);
    try {
      const res = await ownerStaffService.create(data);
      if (res.isSuccess) {
        toast.success("Tạo nhân viên thành công", {
           description: `Email: ${data.email} - Pass: ${data.password}`
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Thất bại", { description: res.error?.message });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản để nhân viên truy cập vào hệ thống Bếp/Phục vụ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: "Nhập họ tên" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl><Input placeholder="0909..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Nhập email", pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email đăng nhập <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="email" placeholder="staff@restaurant.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu <span className="text-red-500">*</span></FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} {...field} />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="branchId"
                rules={{ required: "Chọn chi nhánh" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi nhánh <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Chọn vai trò" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Staff">Phục vụ (Waiter)</SelectItem>
                        <SelectItem value="Chef">Đầu bếp (Chef)</SelectItem>
                        <SelectItem value="Cashier">Thu ngân (Cashier)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}