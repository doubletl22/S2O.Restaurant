'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  Phone,
  Mail,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { adminService, TenantDto, CreateTenantPayload } from '@/services/admin.service'

export default function RestaurantsPage() {
  const [tenants, setTenants] = useState<TenantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // State cho Modal tạo mới
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ A) Thêm ownerName vào state khởi tạo
  const [formData, setFormData] = useState<CreateTenantPayload>({
    name: '',
    ownerName: '', // ✅ thêm
    email: '',
    password: 'Password123!', // Mặc định hoặc cho nhập
    phone: '',
    address: '',
    subscriptionPlan: 'Basic',
  })

  // 1. Fetch dữ liệu
  const fetchTenants = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllTenants()
      // Backend có thể trả về wrapped result hoặc mảng trực tiếp
      const list = Array.isArray(data) ? data : (data as any).value || []
      setTenants(list)
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải danh sách nhà hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  // 2. Xử lý tạo mới
  const handleCreate = async () => {
    try {
      setIsSubmitting(true)
      await adminService.createTenant(formData)
      toast.success('Đã tạo nhà hàng thành công!')
      setIsOpen(false)
      fetchTenants() // Reload list

      // ✅ Reset form (có ownerName)
      setFormData({
        name: '',
        ownerName: '',
        email: '',
        password: 'Password123!',
        phone: '',
        address: '',
        subscriptionPlan: 'Basic',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Lỗi khi tạo nhà hàng')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Xử lý Khóa/Mở khóa
  const handleToggleLock = async (tenant: TenantDto) => {
    try {
      await adminService.toggleLockTenant(tenant.id, tenant.isLocked)
      toast.success(tenant.isLocked ? 'Đã mở khóa nhà hàng' : 'Đã khóa nhà hàng')

      // Cập nhật UI cục bộ để đỡ phải fetch lại
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, isLocked: !t.isLocked } : t))
      )
    } catch (error) {
      toast.error('Thao tác thất bại')
    }
  }

  // Filter local
  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhà hàng</h1>
          <p className="text-muted-foreground">Danh sách các đối tác sử dụng hệ thống</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm nhà hàng
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Thêm đối tác mới</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Tên quán */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tên quán</Label>
                <Input
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: S2O Restaurant"
                />
              </div>

              {/* ✅ B) Thêm input Chủ quán */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Chủ quán</Label>
                <Input
                  className="col-span-3"
                  value={(formData as any).ownerName || ''}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value } as any)}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email Admin</Label>
                <Input
                  className="col-span-3"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              {/* SĐT */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">SĐT</Label>
                <Input
                  className="col-span-3"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="VD: 0901234567"
                />
              </div>

              {/* Địa chỉ */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Địa chỉ</Label>
                <Input
                  className="col-span-3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: 123 Lê Lợi, Q1"
                />
              </div>

              {/* Gói */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gói</Label>
                <select
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.subscriptionPlan}
                  onChange={(e) =>
                    setFormData({ ...formData, subscriptionPlan: e.target.value as any })
                  }
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                Tạo mới
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <Input
          placeholder="Tìm kiếm theo tên, email..."
          className="border-0 focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thông tin</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Gói dịch vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {tenant.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" /> {tenant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />{' '}
                        {tenant.phoneNumber || '---'}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {tenant.subscriptionPlan}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {tenant.isLocked ? (
                      <Badge variant="destructive">Đang khóa</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Hoạt động
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
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleLock(tenant)}>
                          {tenant.isLocked ? (
                            <>
                              <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                            </>
                          )}
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
    </div>
  )
}
