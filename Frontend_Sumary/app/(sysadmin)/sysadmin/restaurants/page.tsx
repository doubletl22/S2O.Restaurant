"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Building2, Lock, Unlock, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { TenantDialog } from "@/components/sysadmin/tenant-dialog";
import { tenantService } from "@/services/tenant.service"; // Dùng tenantService
import { Tenant } from "@/lib/types";

export default function RestaurantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Delete Confirmation State
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await tenantService.getAll();
      if (res.isSuccess) setTenants(res.value);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý Khóa / Mở khóa
  const handleToggleLock = async (tenant: Tenant) => {
    const action = tenant.isLocked ? "mở khóa" : "khóa";
    if (!confirm(`Bạn có chắc muốn ${action} nhà hàng ${tenant.name}?`)) return;

    try {
      const res = await tenantService.toggleLock(tenant.id, !tenant.isLocked);
      if (res.isSuccess) {
        toast.success(`Đã ${action} thành công`);
        loadData();
      } else {
        toast.error("Thao tác thất bại", { description: res.error?.message });
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  // Xử lý Xóa
  const handleDelete = async () => {
    if (!tenantToDelete) return;
    try {
      const res = await tenantService.delete(tenantToDelete);
      if (res.isSuccess) {
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

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Quản lý Đối tác</h1>
           <p className="text-muted-foreground text-sm">Danh sách các nhà hàng (Tenants) trên hệ thống.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Đăng ký mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card p-2 rounded-md border w-full sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Tìm kiếm nhà hàng..." 
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Nhà hàng</TableHead>
              <TableHead>Gói cước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Đang tải dữ liệu...</TableCell>
               </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  Chưa có nhà hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span>{tenant.name}</span>
                        {/* Owner Email có thể undefined nếu tenant chưa link owner */}
                        <span className="text-xs text-muted-foreground">{tenant.ownerEmail || "N/A"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs">{tenant.planType || tenant.subscriptionPlan}</Badge>
                  </TableCell>
                  <TableCell>
                    {tenant.isLocked ? (
                      <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" /> Đã khóa</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-200">
                        <Unlock className="h-3 w-3" /> Hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString("vi-VN") : '---'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Quản trị</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleLock(tenant)}>
                          {tenant.isLocked ? (
                            <><Unlock className="mr-2 h-4 w-4" /> Mở khóa dịch vụ</>
                          ) : (
                            <><Lock className="mr-2 h-4 w-4" /> Khóa dịch vụ</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setTenantToDelete(tenant.id)}
                        >
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
      </div>

      <TenantDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={loadData}
      />

      {/* Alert Confirm Delete */}
      <AlertDialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>CẢNH BÁO: Xóa nhà hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu (Database, User, Menu...) của nhà hàng này. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}