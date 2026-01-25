// Đường dẫn: app/(admin)/admin/users/page.tsx
"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";

// Định nghĩa kiểu dữ liệu (TypeScript)
interface User {
  id: number;
  name: string;
  role: "Admin" | "Manager" | "Customer" | "Staff";
  email: string;
}

// Mock data giống file Users.jsx cũ của em
const users: User[] = [
  { id: 1, name: "admin", role: "Admin", email: "admin@foodscan.com" },
  { id: 2, name: "Alice Nguyen", role: "Manager", email: "alice@kfc.com" },
  { id: 3, name: "Tran Van B", role: "Customer", email: "btran@gmail.com" },
  { id: 4, name: "Nguyen Van C", role: "Staff", email: "staff@s2o.vn" },
];

export default function UsersPage() {
  // Hàm chọn màu Badge dựa theo Role
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive"; // Màu đỏ
      case "Manager": return "default";     // Màu đen/tối
      case "Staff": return "secondary";     // Màu xám
      default: return "outline";            // Viền mỏng
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Danh sách nhân sự và khách hàng trong hệ thống S2O.</p>
        </div>
        <Button className="bg-linear-to-r from-(--g1) to-(--g2) text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-62.5">Tên người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {/* Nếu có ảnh thật thì dùng AvatarImage, ko có thì dùng chữ cái đầu */}
                        <AvatarImage src={`/images/users/${user.id}.png`} alt={user.name} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}