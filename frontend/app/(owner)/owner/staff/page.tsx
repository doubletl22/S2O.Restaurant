"use client";

import { useState } from "react";
import { useStaffs, useDeleteStaff } from "@/hooks/use-staff";
import { useBranches } from "@/hooks/use-branches";
import { StaffDialog } from "@/components/owner/staff-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, UserPlus, Phone, MapPin, Edit, ShieldCheck, ChefHat, Utensils, 
  Loader2, Trash2, Mail 
} from "lucide-react";

export default function StaffPage() {
  const [filterBranchId, setFilterBranchId] = useState<string>("ALL");
  
  // State quản lý Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const { data: branches } = useBranches();
  const { data: staffs, isLoading } = useStaffs(filterBranchId === "ALL" ? undefined : filterBranchId);
  const deleteMutation = useDeleteStaff();

  // --- 1. HÀM XỬ LÝ THÊM MỚI ---
  const handleCreate = () => {
    setEditingStaff(null);   // Reset data cũ
    setIsViewOnly(false);    // Cho phép nhập liệu
    setIsDialogOpen(true);   // Mở Dialog
  };

  // --- 2. HÀM XỬ LÝ XEM CHI TIẾT ---
  const handleView = (staff: any) => {
    setEditingStaff(staff);
    setIsViewOnly(true);     // Chỉ xem
    setIsDialogOpen(true);
  };

  // --- 3. HÀM XỬ LÝ CHỈNH SỬA ---
  const handleEdit = (staff: any) => {
    setEditingStaff(staff);
    setIsViewOnly(false);    // Cho phép sửa
    setIsDialogOpen(true);
  };

  const handleDelete = (staff: any) => {
    if (confirm(`Xóa nhân viên ${staff.fullName}?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Manager": return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      case "Chef": return <ChefHat className="h-5 w-5 text-orange-600" />;
      default: return <Utensils className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Manager": return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Quản lý</Badge>;
      case "Chef": return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Bếp</Badge>;
      default: return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Phục vụ</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> Quản lý nhân viên
          </h1>
          <p className="text-muted-foreground">Phân quyền truy cập cho nhân viên bếp và phục vụ.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Dropdown lọc chi nhánh */}
          <Select value={filterBranchId} onValueChange={setFilterBranchId}>
            <SelectTrigger className="w-50 bg-background">
              <SelectValue placeholder="Lọc theo chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chi nhánh</SelectItem>
              {branches?.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* [QUAN TRỌNG] NÚT THÊM NHÂN VIÊN */}
          <Button onClick={handleCreate}>
            <UserPlus className="h-4 w-4 mr-2" /> Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* --- GRID DANH SÁCH --- */}
      <div className="flex-1 overflow-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : staffs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
            <Users className="h-10 w-10 mb-2 opacity-50" />
            <p>Chưa có nhân viên nào.</p>
            <Button variant="link" onClick={handleCreate}>Thêm nhân viên ngay</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {staffs?.map((staff: any) => (
              <Card 
                key={staff.id} 
                className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary relative overflow-hidden" 
                onClick={() => handleView(staff)}
              >
                <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                          {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="overflow-hidden">
                          <CardTitle className="text-base truncate">{staff.fullName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-xs mt-1">
                             <Mail className="h-3 w-3" /> {staff.email}
                          </CardDescription>
                      </div>
                  </div>
                  {getRoleIcon(staff.role)}
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                          <span className="text-muted-foreground text-xs font-medium uppercase">Vai trò</span>
                          {getRoleBadge(staff.role)}
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                          <span className="text-muted-foreground text-xs font-medium uppercase">Chi nhánh</span>
                          <div className="flex items-center gap-1 font-medium truncate max-w-30">
                              <MapPin className="h-3 w-3 text-muted-foreground" /> 
                              {branches?.find((b:any) => b.id === staff.branchId)?.name || "Unknown"}
                          </div>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                          <span className="text-muted-foreground text-xs">Trạng thái</span>
                          <Badge variant={staff.isActive ? "outline" : "destructive"} className="text-[10px] h-5">
                              {staff.isActive ? "Hoạt động" : "Đã khóa"}
                          </Badge>
                      </div>
                  </div>
                  
                  {/* Action Buttons: Chỉ hiện khi hover */}
                  <div className="flex gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-8 text-xs" 
                        onClick={(e) => { e.stopPropagation(); handleEdit(staff); }}
                    >
                        <Edit className="h-3 w-3 mr-1" /> Sửa
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                        onClick={(e) => { e.stopPropagation(); handleDelete(staff); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- DIALOG COMPONENT --- */}
      <StaffDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        staffToEdit={editingStaff}
        initialViewMode={isViewOnly} 
      />
    </div>
  );
}