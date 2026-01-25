"use client";

import React, { useState } from "react";
import { 
  Eye, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  MapPin, 
  DollarSign 
} from "lucide-react";

// Import các component shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Định nghĩa kiểu dữ liệu (TypeScript)
interface Restaurant {
  id: number;
  name: string;
  address: string;
  revenue: string;
  status: "Active" | "Blocked" | "Closed";
}

// Mock Data ban đầu
const initialData: Restaurant[] = [
  { id: 1, name: "CN Quận 1", address: "123 Nguyễn Huệ, Q1, TP.HCM", revenue: "1,200,000,000", status: "Active" },
  { id: 2, name: "CN Quận 2", address: "Thảo Điền, Q2, TP.HCM", revenue: "850,000,000", status: "Active" },
  { id: 3, name: "CN Quận 3", address: "Võ Văn Tần, Q3, TP.HCM", revenue: "0", status: "Blocked" },
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Restaurant>({
    id: 0,
    name: "",
    address: "",
    revenue: "",
    status: "Active",
  });

  // Filter Logic
  const filteredRestaurants = restaurants.filter((res) =>
    res.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở Dialog (Thêm hoặc Sửa)
  const handleOpenDialog = (restaurant?: Restaurant) => {
    if (restaurant) {
      setIsEditMode(true);
      setFormData(restaurant);
    } else {
      setIsEditMode(false);
      setFormData({
        id: Date.now(), // Tạo ID tạm
        name: "",
        address: "",
        revenue: "",
        status: "Active",
      });
    }
    setIsDialogOpen(true);
  };

  // Xử lý Lưu
  const handleSave = () => {
    if (!formData.name || !formData.address) return; // Validate đơn giản

    if (isEditMode) {
      setRestaurants(restaurants.map((item) => (item.id === formData.id ? formData : item)));
    } else {
      setRestaurants([...restaurants, formData]);
    }
    setIsDialogOpen(false);
  };

  // Xử lý Xóa
  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) {
      setRestaurants(restaurants.filter((item) => item.id !== id));
    }
  };

  // Helper chọn màu Badge trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Blocked": return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-(--text)]">Quản lý Nhà hàng</h2>
          <p className="text-muted-foreground">Quản lý danh sách chi nhánh và doanh thu.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm chi nhánh..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-linear-to-r from-(--g1) to-var(--g2) text-white hover:opacity-90 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-(--line) shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Danh sách chi nhánh ({filteredRestaurants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12.5">ID</TableHead>
                <TableHead>Tên chi nhánh</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Doanh thu (VNĐ)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((res, index) => (
                  <TableRow key={res.id} className="group">
                    <TableCell className="font-medium text-muted-foreground">#{index + 1}</TableCell>
                    <TableCell className="font-bold text-(--text)">{res.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} /> {res.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-emerald-600">
                        <DollarSign size={14} /> {res.revenue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(res.status)}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          onClick={() => handleOpenDialog(res)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(res.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không tìm thấy kết quả nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Thêm / Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-106.5">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Chỉnh sửa thông tin" : "Thêm chi nhánh mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên nhà hàng</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ví dụ: S2O Quận 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="123 Đường ABC..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="revenue">Doanh thu hiện tại</Label>
              <Input 
                id="revenue" 
                value={formData.revenue} 
                onChange={(e) => setFormData({...formData, revenue: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: any) => setFormData({...formData, status: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động (Active)</SelectItem>
                  <SelectItem value="Blocked">Tạm khóa (Blocked)</SelectItem>
                  <SelectItem value="Closed">Đóng cửa (Closed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleSave} className="bg-linear-to-r from-(--g1) to-(--g2) text-white">
              {isEditMode ? "Lưu thay đổi" : "Tạo chi nhánh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}