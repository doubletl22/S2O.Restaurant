"use client";

import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, Store, QrCode, Trash2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code"; // Cần cài: npm install react-qr-code

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { branchService } from "@/services/branch.service";
import { tableService } from "@/services/table.service";
import { Branch, Table } from "@/lib/types";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Bàn (trong Sheet)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // State tạo bàn mới
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  // --- 1. Load Data Chi Nhánh ---
  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await branchService.getAll();
      if (res.isSuccess) setBranches(res.value);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // --- 2. Xử lý logic Bàn (Tables) ---
  const openTableManager = async (branch: Branch) => {
    setSelectedBranch(branch);
    setIsSheetOpen(true);
    setTables([]); // Reset tạm
    try {
      const res = await tableService.getByBranch(branch.id);
      if (res.isSuccess) setTables(res.value);
    } catch (e) {
      toast.error("Lỗi tải danh sách bàn");
    }
  };

  const handleCreateTable = async () => {
    if (!selectedBranch || !newTableName) return;
    try {
      const res = await tableService.create({
        name: newTableName,
        capacity: newTableCapacity,
        branchId: selectedBranch.id
      });
      
      if (res.isSuccess) {
        toast.success("Thêm bàn thành công");
        setNewTableName("");
        // Reload tables
        const tablesRes = await tableService.getByBranch(selectedBranch.id);
        if (tablesRes.isSuccess) setTables(tablesRes.value);
      }
    } catch (e) {
      toast.error("Không thể tạo bàn");
    }
  };

  const handleDeleteTable = async (id: string) => {
    if(!confirm("Bạn có chắc muốn xóa bàn này?")) return;
    try {
      await tableService.delete(id);
      toast.success("Đã xóa bàn");
      setTables(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      toast.error("Lỗi khi xóa");
    }
  };

  // --- 3. QR Print Dialog ---
  const [qrTable, setQrTable] = useState<Table | null>(null);
  
  // Helper: Link Guest
  // Giả sử domain deploy là https://s2o.app
  // Khi dev: http://localhost:3000
  const getGuestLink = (token: string) => {
    if (typeof window !== "undefined") {
        return `${window.location.origin}/guest/t/${token}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Quản lý Chi nhánh</h1>
           <p className="text-muted-foreground text-sm">Thiết lập các điểm bán và sơ đồ bàn ăn.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm chi nhánh
        </Button>
      </div>

      {/* Danh sách Chi nhánh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                {branch.name}
              </CardTitle>
              <CardDescription>
                 <span className="flex items-center gap-1 mt-1">
                   <MapPin className="h-3 w-3" /> {branch.address}
                 </span>
                 <span className="flex items-center gap-1 mt-1">
                   <Phone className="h-3 w-3" /> {branch.phone}
                 </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => openTableManager(branch)}>
                  <QrCode className="mr-2 h-4 w-4" /> Quản lý Bàn & QR
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                   <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SHEET QUẢN LÝ BÀN (Trượt từ phải sang) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[100 sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Quản lý Bàn ăn - {selectedBranch?.name}</SheetTitle>
            <SheetDescription>
              Tạo bàn và lấy mã QR để dán lên bàn cho khách gọi món.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Form thêm bàn nhanh */}
            <div className="flex gap-2 items-end bg-muted/50 p-3 rounded-lg border">
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="t-name">Tên bàn</Label>
                <Input 
                  id="t-name" 
                  placeholder="Vd: Bàn 01" 
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5 w-20">
                <Label htmlFor="t-cap">Ghế</Label>
                <Input 
                  id="t-cap" 
                  type="number" 
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value))}
                />
              </div>
              <Button onClick={handleCreateTable}><Plus className="h-4 w-4" /></Button>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-1 gap-3">
                {tables.map(table => (
                  <div key={table.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                          {table.name.replace(/[^0-9]/g, '') || "B"}
                        </div>
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs text-muted-foreground">{table.capacity} ghế • {table.status}</div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {/* Nút xem QR */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setQrTable(table)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="text-center">{table.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                               <div className="border-4 border-black p-2 rounded-lg">
                                  {/* QR Code Generate */}
                                  <QRCode 
                                    value={getGuestLink(table.qrToken)} 
                                    size={200} 
                                  />
                               </div>
                               <p className="text-sm text-center text-muted-foreground break-all px-4">
                                 {getGuestLink(table.qrToken)}
                               </p>
                               <Button className="w-full" onClick={() => window.print()}>
                                 In mã QR
                               </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteTable(table.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}