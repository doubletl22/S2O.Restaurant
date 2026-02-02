"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Lock, Unlock, Trash2, MoreHorizontal, KeyRound, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Cần import Select để chọn Role

import { adminService } from "@/services/admin.service";
import { User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create User State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "SystemAdmin" });

  // Reset Password State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSystemUsers();
      
      // Kiểm tra res có dữ liệu items không (PagedResult)
      if (res && Array.isArray(res.items)) {
        setUsers(res.items);
      } else {
        setUsers([]); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateUser = async () => {
      try {
          // System Admin chỉ tạo System Admin khác. Nếu muốn tạo Owner thì phải có TenantId (như logic backend đã viết)
          // Ở đây demo tạo System Admin đơn giản
          await adminService.createUser(newUser);
          toast.success("Tạo tài khoản thành công");
          setCreateDialogOpen(false);
          setNewUser({ fullName: "", email: "", password: "", role: "SystemAdmin" });
          loadData();
      } catch (e: any) {
          toast.error("Tạo thất bại", { description: e?.response?.data || "Lỗi không xác định" });
      }
  }

  const handleToggleLock = async (user: User) => {
    // User interface cần bổ sung field IsLocked từ backend trả về
    // Ép kiểu tạm thời để TS không báo lỗi: (user as any).isLocked
    const isLocked = (user as any).isLocked; 
    const action = isLocked ? "mở khóa" : "khóa";
    
    if (!confirm(`Bạn có muốn ${action} tài khoản ${user.email}?`)) return;

    try {
      if (isLocked) await adminService.unlockUser(user.id);
      else await adminService.lockUser(user.id);
      
      toast.success("Thao tác thành công");
      loadData();
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cảnh báo: Xóa vĩnh viễn người dùng này?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("Đã xóa người dùng");
      loadData();
    } catch (e) {
      toast.error("Lỗi khi xóa");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      await adminService.resetPassword(selectedUser.id, newPassword);
      toast.success(`Đã đổi mật khẩu cho ${selectedUser.fullName}`);
      setResetDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (e) {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold">Tài khoản Hệ thống</h1>
           <p className="text-muted-foreground text-sm">Quản lý toàn bộ người dùng trong AspNetUsers.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Admin
        </Button>
      </div>

      <div className="flex bg-card p-2 rounded-md border w-full sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2 mt-3" />
        <Input 
          placeholder="Tìm user..." 
          className="border-0 focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24">Đang tải...</TableCell></TableRow> : 
            filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border">
                        <UserIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Roles là mảng string */}
                    {user.roles && user.roles.map(r => (
                        <Badge key={r} variant="outline" className="mr-1">{r}</Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                     {(user as any).isLocked ? 
                        <Badge variant="destructive">Locked</Badge> : 
                        <Badge variant="secondary" className="text-green-600 bg-green-50">Active</Badge>
                     }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setResetDialogOpen(true); }}>
                          <KeyRound className="mr-2 h-4 w-4" /> Đổi mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(user)}>
                           {(user as any).isLocked ? <><Unlock className="mr-2 h-4 w-4" /> Mở khóa</> : <><Lock className="mr-2 h-4 w-4" /> Khóa</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Create Admin */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Thêm System Admin mới</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
                <div><Label>Email</Label><Input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
                <div><Label>Họ tên</Label><Input value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} /></div>
                <div><Label>Mật khẩu</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                <div>
                    <Label>Vai trò</Label>
                    <Input disabled value="SystemAdmin" />
                    <p className="text-xs text-muted-foreground mt-1">Để tạo Chủ nhà hàng, vui lòng vào trang Quản lý Đối tác.</p>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleCreateUser}>Tạo tài khoản</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Reset Password (Giữ nguyên như cũ) */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Đặt lại mật khẩu</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Tài khoản</Label><Input value={selectedUser?.email || ""} disabled className="bg-muted" /></div>
            <div><Label>Mật khẩu mới</Label><Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}