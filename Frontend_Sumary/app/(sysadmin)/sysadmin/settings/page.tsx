"use client";

import React from "react";
import { User, Lock, Bell, Moon, Smartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
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
                  <AvatarFallback className="text-xl bg-orange-100 text-orange-600">AD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Thay đổi ảnh</Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input defaultValue="Nguyen Van Admin" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="admin@s2o.vn" disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input defaultValue="0987654321" />
                </div>
                <div className="space-y-2">
                  <Label>Chức vụ</Label>
                  <Input defaultValue="Quản lý hệ thống" disabled className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button className="bg-linear-to-r from-(--g1) to-(--g2) text-white">Lưu thay đổi</Button>
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
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu mới</Label>
                <Input type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline">Cập nhật mật khẩu</Button>
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