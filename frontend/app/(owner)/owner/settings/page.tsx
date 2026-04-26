"use client";

import React, { useEffect, useState } from "react";
import { User, Lock, Bell, Moon, Smartphone, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/auth.service";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roleLabel, setRoleLabel] = useState("Chủ nhà hàng");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getErrorMessage = (error: any): string => {
    if (!error) return "Thao tác thất bại";
    if (typeof error === "object") {
      if (typeof error.description === "string") return error.description;
      if (typeof error.detail === "string") return error.detail;
      if (typeof error.title === "string") return error.title;
      if (typeof error.message === "string") return error.message;
    }
    return "Thao tác thất bại";
  };

  const resolveRoleLabel = (roles?: string[]) => {
    if (!roles || roles.length === 0) return "Chủ nhà hàng";
    if (roles.includes("RestaurantOwner") || roles.includes("Owner")) return "Chủ nhà hàng";
    if (roles.includes("SystemAdmin")) return "Quản lý hệ thống";
    return roles[0];
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsProfileLoading(true);
      try {
        const profile = await authService.getProfile();
        setFullName(profile.fullName || "");
        setEmail(profile.email || "");
        setPhoneNumber(profile.phoneNumber || "");
        setRoleLabel(resolveRoleLabel(profile.roles));
      } catch (error: any) {
        const message = getErrorMessage(error);
        toast.error("Không thể tải hồ sơ", { description: message });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Họ và tên không hợp lệ.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await authService.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      toast.success("Cập nhật hồ sơ thành công.");

      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.fullName = fullName.trim();
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error("Cập nhật hồ sơ thất bại", { description: message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error("Đổi mật khẩu thất bại", { description: message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-(--text)">Cài đặt</h2>
        <p className="text-muted-foreground">Quản lý hồ sơ, bảo mật và tùy chọn hệ thống.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-100">
          <TabsTrigger value="general">Hồ sơ</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>
        
        {/* --- Tab Hồ sơ --- */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật tên hiển thị và email liên hệ của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/avatar-placeholder.jpg" />
                  <AvatarFallback className="text-xl bg-orange-100 text-orange-600">
                    {(fullName || "AD")
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(word => word[0]?.toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Thay đổi ảnh</Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={isProfileLoading || isSavingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    disabled={isProfileLoading || isSavingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chức vụ</Label>
                  <Input value={roleLabel} disabled className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                className="bg-linear-to-r from-(--g1) to-(--g2) text-white"
                onClick={handleSaveProfile}
                disabled={isProfileLoading || isSavingProfile}
              >
                {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Tab Bảo mật --- */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Để bảo mật, vui lòng không chia sẻ mật khẩu cho người khác.</CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mật khẩu hiện tại</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu mới</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Xác nhận mật khẩu mới</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </Button>
              </CardFooter>
            </Card>

          <Card className="border-red-100 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-600">Vùng nguy hiểm</CardTitle>
              <CardDescription>Các hành động này không thể hoàn tác.</CardDescription>
            </CardHeader>
            <CardContent>
               <Button variant="destructive" className="w-full sm:w-auto">
                 <LogOut className="mr-2 h-4 w-4" /> Đăng xuất khỏi mọi thiết bị
               </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab Hệ thống --- */}
        <TabsContent value="system" className="mt-6 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Cấu hình chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Thông báo Email</Label>
                  <p className="text-sm text-muted-foreground">Nhận email khi có đơn hàng lớn hoặc lỗi hệ thống.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                  <Label className="text-base">Giao diện tối (Dark Mode)</Label>
                  <p className="text-sm text-muted-foreground">Tự động chuyển sang nền tối vào ban đêm.</p>
                </div>
                <Switch />
              </div>
              <Separator />
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                  <Label className="text-base">Âm thanh thông báo</Label>
                  <p className="text-sm text-muted-foreground">Phát tiếng "Ting" khi có Order mới từ bếp.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
