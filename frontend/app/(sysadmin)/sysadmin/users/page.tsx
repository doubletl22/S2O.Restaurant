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
import { adminService } from "@/services/admin.service";
import { User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "SystemAdmin" });

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const loadData = async (page = 1, keyword = "") => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page,
        size: pageSize,
      };

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const res = await adminService.getSystemUsers(params);

      if (res && Array.isArray(res.items)) {
        setUsers(res.items);
        setTotalCount(typeof res.totalCount === "number" ? res.totalCount : res.items.length);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error("Load data error:", error);
      
      // Check if 401 Unauthorized
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        // HTTP interceptor đã handle redirect, nhưng confirm one more time
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error("Lỗi tải danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData(currentPage, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateUser = async () => {
    try {
      await adminService.createUser(newUser);
      toast.success("Tạo tài khoản thành công");
      setCreateDialogOpen(false);
      setNewUser({ fullName: "", email: "", password: "", role: "SystemAdmin" });
      await loadData(currentPage, searchTerm);
    } catch (e: any) {
      toast.error("Tạo thất bại", {
        description: e?.response?.data || e?.description || e?.message || "Lỗi không xác định",
      });
    }
  };

  const handleToggleLock = async (user: User) => {
    const isLocked = (user as any).isLocked;
    const action = isLocked ? "mở khóa" : "khóa";

    if (!confirm(`Bạn có muốn ${action} tài khoản ${user.email}?`)) return;

    try {
      if (isLocked) await adminService.unlockUser(user.id);
      else await adminService.lockUser(user.id);

      toast.success("Thao tác thành công");
      await loadData(currentPage, searchTerm);
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cảnh báo: Xóa vĩnh viễn người dùng này?")) return;

    try {
      await adminService.deleteUser(id);
      toast.success("Đã xóa người dùng");
      await loadData(currentPage, searchTerm);
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

      <div className="rounded-md border bg-card max-h-[65vh] overflow-y-auto">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                    {user.roles?.map((role) => (
                      <Badge key={role} variant="outline" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {(user as any).isLocked ? (
                      <Badge variant="destructive">Locked</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        Active
                      </Badge>
                    )}
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
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setResetDialogOpen(true); }}>
                          <KeyRound className="mr-2 h-4 w-4" /> Đổi mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(user)}>
                          {(user as any).isLocked ? (
                            <>
                              <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" /> Khóa
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
          <div className="text-muted-foreground">Hiển thị {users.length} / {totalCount} người dùng</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || loading}
            >
              Trước
            </Button>
            <span className="text-muted-foreground">Trang {currentPage}/{totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm System Admin mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Email</Label>
              <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div>
              <Label>Họ tên</Label>
              <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
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

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tài khoản</Label>
              <Input value={selectedUser?.email || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Mật khẩu mới</Label>
              <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
