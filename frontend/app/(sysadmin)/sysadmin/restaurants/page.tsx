"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Building2, Lock, Unlock, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TenantDialog } from "@/components/sysadmin/tenant-dialog";
import { tenantService } from "@/services/tenant.service";
import { Tenant } from "@/lib/types";

export default function RestaurantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (keyword?: string) => {
    try {
      setLoading(true);
      const res = await tenantService.getAll(keyword);
      
      if (res && res.isSuccess && Array.isArray(res.value)) {
        setTenants(res.value);
      } else {
        setTenants([]); // Fallback về mảng rỗng nếu lỗi
        if (res && !res.isSuccess) {
            toast.error("Lỗi tải dữ liệu", { description: res.error?.message });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleToggleLock = async (tenant: Tenant) => {
    // Nếu đang khóa (isLocked=true) -> Cần mở (isLocked mới = false)
    // Nếu đang mở (isLocked=false) -> Cần khóa (isLocked mới = true)
    const newStatusIsLocked = !tenant.isLocked;
    const actionText = newStatusIsLocked ? "khóa" : "mở khóa";

    if (!confirm(`Bạn có chắc muốn ${actionText} nhà hàng ${tenant.name}?`)) return;

    try {
      const res = await tenantService.toggleLock(tenant.id, newStatusIsLocked);
      if (res.isSuccess) {
        toast.success(`Đã ${actionText} thành công`);
        loadData();
      } else {
        toast.error("Thao tác thất bại", { description: res.error?.message });
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    try {
      const res = await tenantService.delete(tenantToDelete);
      // Backend trả về NoContent (204) cho delete thường được coi là success
      // Kiểm tra library http của bạn handle 204 thế nào. Thường isSuccess = true.
      if (res?.isSuccess || res === undefined) { 
        toast.success("Đã xóa nhà hàng vĩnh viễn");
        loadData();
      } else {
         toast.error("Không thể xóa", { description: res.error?.message });
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xóa nhà hàng");
    } finally {
      setTenantToDelete(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(tenants.length / pageSize));
  const pagedTenants = tenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Quản lý Đối tác</h1>
           <p className="text-muted-foreground text-sm">Danh sách các nhà hàng (Tenants) trên hệ thống.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Đăng ký mới
        </Button>
      </div>

      <div className="flex bg-card p-2 rounded-md border w-full sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2 mt-3" />
        <Input 
          placeholder="Tìm kiếm nhà hàng..." 
          className="border-0 focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhà hàng</TableHead>
              <TableHead>Gói cước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24">Đang tải...</TableCell></TableRow>
            ) : tenants.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-32">Không có dữ liệu.</TableCell></TableRow>
            ) : (
              pagedTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border">
                        <Building2 className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span>{tenant.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[260px]">{tenant.id}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs">
                      {tenant.planType || tenant.subscriptionPlan || "Standard"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {tenant.isLocked ? (
                      <Badge variant="destructive">Locked</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-green-600 bg-green-50">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {/* Backend trả về DateTime, cần format */}
                    {new Date(tenant.createdAt || tenant.createdOn || Date.now()).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Quản trị</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleLock(tenant)}>
                          {tenant.isLocked ? <><Unlock className="mr-2 h-4 w-4" /> Mở khóa</> : <><Lock className="mr-2 h-4 w-4" /> Khóa</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setTenantToDelete(tenant.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa dữ liệu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            Hiển thị {pagedTenants.length} / {tenants.length} nhà hàng
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-muted-foreground">Trang {currentPage}/{totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
      
      {/* Dialogs logic... */}
      <TenantDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={loadData} />
      <AlertDialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <AlertDialogContent>
             <AlertDialogHeader>
            <AlertDialogTitle>Cảnh báo xóa nhà hàng</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Xóa vĩnh viễn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
