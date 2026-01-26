"use client";

import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; 
import { Printer, RefreshCcw, Search, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getCookie } from "cookies-next";

// Interface khớp với TableResponse.cs
interface Table {
  id: string;
  name: string;
  capacity: number;
  tenantId: string;
  qrCodeGuid: string;
}

interface ApiResult<T> {
  value: T;
  isSuccess: boolean;
  error: any;
}

export default function QrCodesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", capacity: 4 });
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // Lấy domain hiện tại (VD: http://localhost:3000 hoặc https://s2o-restaurant.com)
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchTables();
  }, []);

  // 1. Hàm lấy danh sách bàn
  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const branchId = getCookie("branch_id");
      // Gọi đúng endpoint backend
      const response = await api.get<ApiResult<Table[]>>(`/tables${branchId ? `?branchId=${branchId}` : ''}`); 
      if (response.data.isSuccess) {
        setTables(response.data.value);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách bàn");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Hàm xử lý Tạo bàn mới
    const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const branchId = getCookie("branch_id");
    if (!branchId) return toast.error("Thiếu Branch ID");
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên bàn");
    if (isNaN(formData.capacity) || formData.capacity <= 0) {
    return toast.error("Sức chứa phải là một số lớn hơn 0");
  }

    setIsSubmitting(true);
    try {
        const payload = {
        BranchId: branchId,
        Name: formData.name,
        Capacity: Number(formData.capacity)
        };
        console.log("Payload gửi đi:", payload);
        const response = await api.post("/tables", payload);
        if (response.data && response.data.isSuccess) { 
            toast.success("Thành công!");
            setIsOpen(false);
            fetchTables();
        } else {
            // Trường hợp Backend trả về isSuccess: false
            const errorMsg = response.data?.error?.description || "Không thể tạo bàn";
            toast.error(errorMsg);
        }
    } catch (error: any) {
        console.error("LỖI TỪ SERVER:", error.response?.data);
        const errorDetail = error.response?.data?.error?.description || "Lỗi 400: Dữ liệu không hợp lệ";
        toast.error(errorDetail);
    } finally {
        setIsSubmitting(false);
    }
    };
// 3. Hàm xử lý Xóa bàn
  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${tableName}?`)) return;

    try {
      const response = await api.delete(`/tables/${tableId}`);
      if (response.status === 200 || response.data?.isSuccess) {
        toast.success(`Đã xóa ${tableName}`);
        setTables(tables.filter(t => t.id !== tableId));
      }
    } catch (error) {
      toast.error("Không thể xóa bàn này");
    }
  };

  const generateMenuLink = (qrGuid: string) => {
    return `${origin}/guest/t/${qrGuid}/menu`;
  };

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-(--text) uppercase tracking-tight">Quản lý QR Code</h1>
          <p className="text-muted-foreground text-sm">Tạo và quản lý mã QR định danh cho từng bàn.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Thêm bàn
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-100">
              <form onSubmit={handleCreateTable}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-blue-600">Thêm bàn mới</DialogTitle>
                  <DialogDescription>Nhập thông tin bàn bên dưới.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-6">
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="name" className="font-bold">Số bàn / Tên bàn</Label>
                    <Input
                      id="name"
                      placeholder="VD: Bàn 01"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="capacity" className="font-bold">Sức chứa (Người)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={isNaN(formData.capacity) ? "" : formData.capacity}
                      onChange={(e) => {const val = e.target.value;
                        setFormData({ ...formData, capacity: val === "" ? NaN : parseInt(val) });}}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white w-full h-11 font-bold text-lg"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "XÁC NHẬN"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchTables} disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          
          <Button onClick={() => window.print()} className="bg-(--g1) text-white font-bold">
            <Printer className="mr-2 h-4 w-4" /> In tất cả
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm tên bàn..."
          className="pl-10 h-11 border-2 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          <p className="font-medium animate-pulse">Đang đồng bộ dữ liệu bàn...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 print:w-full">
          {filteredTables.map((table) => {
            const finalLink = generateMenuLink(table.qrCodeGuid);
            return (
              <Card 
                key={table.id} 
                className="group relative flex flex-col items-center border-2 hover:border-blue-500 transition-all duration-300 print:border-none print:shadow-none break-inside-avoid shadow-sm overflow-hidden"
              >
                {/* NÚT XÓA: Hiện khi hover, ẩn khi in */}
                <button 
                  onClick={() => handleDeleteTable(table.id, table.name)}
                  className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <CardHeader className="pb-0 pt-6 w-full px-2 print:hidden text-center">
                  <CardTitle className="text-2xl font-black text-gray-800 tracking-tight">
                    {table.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1 w-fit mx-auto font-bold uppercase text-[9px]">
                    Sức chứa: {table.capacity}
                  </Badge>
                </CardHeader>
                
                <CardContent className="py-6 flex flex-col items-center justify-center w-full">
                  <div className="bg-white p-2 rounded-xl border-2 border-gray-100 flex items-center justify-center print:border-none aspect-square shadow-sm">
                    <QRCodeCanvas value={finalLink} size={150} level={"H"} />
                  </div>
                  
                  {/* Tên bàn nhỏ xíu khi in */}
                  <div className="hidden print:block text-sm font-bold mt-2 text-black uppercase">
                    {table.name}
                  </div>

                  <div className="print:hidden mt-4 w-full text-center">
                    <code className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                       GUID: {table.qrCodeGuid.slice(0, 8)}...
                    </code>
                  </div>

                  <div className="print:hidden mt-3 w-full px-2">
                        <a 
                          href={finalLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-blue-500 hover:underline font-mono truncate block"
                        >
                           Test: /guest/menu/...
                        </a>
                     </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @media print {
          aside, header, nav, footer, .print\\:hidden { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 1cm !important; }
          .grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 20px !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}