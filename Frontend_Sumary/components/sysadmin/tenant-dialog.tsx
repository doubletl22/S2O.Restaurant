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
import { ScrollArea } from "@/components/ui/scroll-area"; // Thêm ScrollArea cho form dài

import { RegisterTenantRequest } from "@/lib/types";
import { tenantService } from "@/services/tenant.service"; // Đổi sang tenantService

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TenantDialog({ open, onOpenChange, onSuccess }: TenantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Setup form đúng với Interface mới
  const form = useForm<RegisterTenantRequest>({
    defaultValues: {
      restaurantName: "",
      ownerName: "",     // Mới
      email: "",
      password: "",
      address: "",       // Mới
      phoneNumber: "",   // Mới
      planType: "Free",  // Mới (PlanType)
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = async (data: RegisterTenantRequest) => {
    setIsLoading(true);
    try {
      const res = await tenantService.create(data);
      if (res.isSuccess) {
        toast.success("Khởi tạo nhà hàng thành công!", {
          description: `Chủ sở hữu: ${data.ownerName} (${data.email})`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        // Fallback error (thường interceptor đã xử lý)
         if (res.error) toast.error(res.error.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 h-[90vh] sm:h-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Đăng ký Nhà hàng mới</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để tạo Tenant và tài khoản Owner.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
              
              {/* === THÔNG TIN NHÀ HÀNG === */}
              <div className="space-y-3 border-b pb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">1. Thông tin Nhà hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    rules={{ required: "Tên nhà hàng là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tên thương hiệu <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="Kichi Kichi..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ required: "Địa chỉ là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Địa chỉ kinh doanh <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="123 Đường ABC..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    rules={{ required: "SĐT là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotline <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="0909..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gói dịch vụ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Chọn gói" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Free">Gói Free</SelectItem>
                            <SelectItem value="Premium">Gói Premium</SelectItem>
                            <SelectItem value="Enterprise">Gói Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* === THÔNG TIN CHỦ SỞ HỮU === */}
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-sm text-muted-foreground">2. Tài khoản Chủ sở hữu (Owner)</h3>
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  rules={{ required: "Họ tên chủ quán là bắt buộc" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email là bắt buộc", pattern: { value: /^\S+@\S+$/i, message: "Email sai" }}}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email đăng nhập <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="owner@gmail.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    rules={{ required: "Mật khẩu là bắt buộc", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } }}
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
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Khởi tạo Nhà hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}