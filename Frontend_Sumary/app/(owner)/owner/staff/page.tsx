"use client";

import { useEffect, useState } from "react";
import { Plus, Search, User, Trash2, Mail, Phone } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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

import { StaffDialog } from "@/components/owner/staff-dialog";
import { ownerStaffService } from "@/services/owner-staff.service";
import { branchService } from "@/services/branch.service";
import { StaffProfile, Branch } from "@/lib/types";

export default function StaffPage() {
  const [staffs, setStaffs] = useState<StaffProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, branchRes] = await Promise.all([
        ownerStaffService.getAll(),
        branchService.getAll()
      ]);

      if (staffRes.isSuccess) setStaffs(staffRes.value);
      if (branchRes.isSuccess) setBranches(branchRes.value);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      const res = await ownerStaffService.delete(staffToDelete);
      if (res.isSuccess) {
        toast.success("Đã xóa nhân viên");
        loadData();
      } else {
        toast.error("Lỗi xóa", { description: res.error?.message });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStaffToDelete(null);
    }
  };

  const filteredStaffs = staffs.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhân viên</h1>
           <p className="text-muted-foreground text-sm">Tài khoản truy cập cho Bếp và Phục vụ.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-card p-2 rounded-md border w-full sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Tìm theo tên, email..." 
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredStaffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  Chưa có nhân viên nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {staff.fullName.charAt(0)}
                      </div>
                      {staff.fullName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {staff.email}</span>
                      {staff.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {staff.phoneNumber}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Map Branch Name nếu backend không trả về name thì dùng branchId */}
                    {branches.find(b => b.id === staff.branchId)?.name || "---"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      staff.role === "Chef" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    }>
                      {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setStaffToDelete(staff.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StaffDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        branches={branches}
        onSuccess={loadData}
      />

      <AlertDialog open={!!staffToDelete} onOpenChange={(open) => !open && setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhân viên này sẽ không thể đăng nhập vào hệ thống nữa.
            </AlertDialogDescription>
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