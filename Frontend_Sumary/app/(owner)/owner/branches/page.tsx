"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, QrCode, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { branchService } from "@/services/branch.service";
import { tableService } from "@/services/table.service";
import { Branch, Table } from "@/lib/types";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Load Branches
  const loadBranches = async () => {
    try {
      const res = await branchService.getAll();
      if (res.isSuccess) {
        setBranches(res.value);
        // Tự động chọn branch đầu tiên nếu chưa chọn
        if (res.value.length > 0 && !selectedBranchId) {
          setSelectedBranchId(res.value[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load Tables khi branch thay đổi
  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      const loadTables = async () => {
        try {
          const res = await tableService.getByBranch(selectedBranchId);
          if (res.isSuccess) {
            setTables(res.value);
          }
        } catch (error) {
          console.error(error);
        }
      };
      loadTables();
    } else {
      setTables([]);
    }
  }, [selectedBranchId]);

  // --- BRANCH HANDLERS ---
  const handleSaveBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      isActive: true
    };

    try {
      if (editingBranch) {
        // Update
        const payload = { ...data, id: editingBranch.id }; // Backend cần ID trong body
        await branchService.update(editingBranch.id, payload);
        toast.success("Cập nhật chi nhánh thành công");
      } else {
        // Create
        await branchService.create(data);
        toast.success("Thêm chi nhánh thành công");
      }
      setIsBranchDialogOpen(false);
      loadBranches();
    } catch (error: any) {
      toast.error("Lỗi: " + (error?.description || "Thất bại"));
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chi nhánh này?")) return;
    try {
      const res = await branchService.delete(id);
      if (res.isSuccess) {
        toast.success("Đã xóa chi nhánh");
        if (selectedBranchId === id) setSelectedBranchId("");
        loadBranches();
      }
    } catch (error) {
      toast.error("Không thể xóa chi nhánh");
    }
  };

  // --- TABLE HANDLERS ---
  const handleSaveTable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBranchId) {
      toast.error("Vui lòng chọn chi nhánh trước");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      capacity: Number(formData.get("capacity")),
      branchId: selectedBranchId,
      isActive: true
    };

    try {
      if (editingTable) {
        await tableService.update(editingTable.id, { ...data, id: editingTable.id });
        toast.success("Cập nhật bàn thành công");
      } else {
        await tableService.create(data);
        toast.success("Thêm bàn thành công");
      }
      setIsTableDialogOpen(false);
      // Reload tables
      const res = await tableService.getByBranch(selectedBranchId);
      if (res.isSuccess) setTables(res.value);
    } catch (error) {
      toast.error("Lỗi lưu bàn");
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Xóa bàn này?")) return;
    try {
      await tableService.delete(id);
      toast.success("Đã xóa bàn");
      // Reload
      if (selectedBranchId) {
         const res = await tableService.getByBranch(selectedBranchId);
         if (res.isSuccess) setTables(res.value);
      }
    } catch (error) {
      toast.error("Lỗi xóa bàn");
    }
  };

  // Helper tạo link QR
  const getQrLink = (tableId: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/guest/t/${tableId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Chi nhánh & Bàn</h1>
      </div>

      <Tabs value={selectedBranchId} onValueChange={setSelectedBranchId} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {branches.map((branch) => (
              <TabsTrigger 
                key={branch.id} 
                value={branch.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md"
              >
                {branch.name}
              </TabsTrigger>
            ))}
            <Button variant="outline" size="sm" onClick={() => { setEditingBranch(null); setIsBranchDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Chi nhánh
            </Button>
          </TabsList>
        </div>

        {branches.map((branch) => (
          <TabsContent key={branch.id} value={branch.id} className="space-y-4">
            {/* Branch Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{branch.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingBranch(branch); setIsBranchDialogOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteBranch(branch.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {branch.address}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {branch.phone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Tables Grid */}
            <div className="flex justify-between items-center mt-6">
              <h3 className="text-lg font-semibold">Danh sách Bàn</h3>
              <Button size="sm" onClick={() => { setEditingTable(null); setIsTableDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Thêm Bàn
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {tables.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">Chưa có bàn nào.</div>
              ) : (
                tables.map((table) => (
                  <Card key={table.id} className="relative group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{table.name}</CardTitle>
                        <Badge variant="secondary">{table.capacity} ghế</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded border">
                         <QrCode className="h-12 w-12 text-gray-800" />
                         <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">
                           {/* [FIX] Check undefined cho table.id trước khi gọi getQrLink */}
                           {table.id ? getQrLink(table.id) : ""}
                         </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTable(table); setIsTableDialogOpen(true); }}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTable(table.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* --- Dialog: Create/Edit Branch --- */}
      <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Sửa thông tin" : "Thêm chi nhánh"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBranch} className="space-y-4">
            <div className="space-y-2">
              <Label>Tên chi nhánh</Label>
              <Input name="name" defaultValue={editingBranch?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input name="address" defaultValue={editingBranch?.address} required />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input name="phone" defaultValue={editingBranch?.phone} required />
            </div>
            <DialogFooter>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog: Create/Edit Table --- */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Sửa bàn" : "Thêm bàn mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTable} className="space-y-4">
            <div className="space-y-2">
              <Label>Tên bàn (VD: Bàn 01)</Label>
              <Input name="name" defaultValue={editingTable?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Số ghế</Label>
              <Input name="capacity" type="number" defaultValue={editingTable?.capacity || 4} required />
            </div>
            <DialogFooter>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}