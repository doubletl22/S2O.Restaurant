'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, User, Mail, Phone, 
  MapPin, Loader2, Trash, Shield 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import { staffService, StaffDto } from '@/services/staff.service'
import { branchService, BranchDto } from '@/services/branch.service'

export default function StaffPage() {
  const [staffs, setStaffs] = useState<StaffDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'Password123!', // Mặc định hoặc cho nhập
    phoneNumber: '',
    role: 'RestaurantStaff',
    branchId: ''
  })

  // 1. Fetch Data (Staffs + Branches)
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Gọi song song 2 API
      const [staffData, branchData] = await Promise.all([
        staffService.getAll().catch(() => []), // Nếu API chưa có thì trả về mảng rỗng để không crash
        branchService.getAll().catch(() => [])
      ]);

      const staffList = Array.isArray(staffData) ? staffData : (staffData as any).value || [];
      const branchList = Array.isArray(branchData) ? branchData : (branchData as any).value || [];
      
      setStaffs(staffList);
      setBranches(branchList);
      
      // Nếu có chi nhánh, mặc định chọn cái đầu tiên
      if(branchList.length > 0) {
          setFormData(prev => ({ ...prev, branchId: branchList[0].id }))
      }

    } catch (error) {
      console.error(error)
      toast.error("Lỗi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Submit Form
  const handleSubmit = async () => {
    if (!formData.email || !formData.branchId || !formData.fullName) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      setIsSubmitting(true)
      await staffService.create(formData)
      toast.success("Tạo nhân viên thành công")
      setIsOpen(false)
      fetchData() // Reload list
      
      // Reset form (giữ lại branchId để nhập tiếp cho tiện)
      setFormData({
        ...formData,
        fullName: '', email: '', phoneNumber: '', password: 'Password123!'
      })
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Lỗi khi tạo nhân viên";
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
      try {
          await staffService.delete(id);
          toast.success("Đã xóa nhân viên");
          fetchData();
      } catch (e) {
          toast.error("Thao tác thất bại");
      }
  }

  const filteredStaffs = staffs.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Nhân viên</h1>
          <p className="text-muted-foreground">Tạo tài khoản cho Phục vụ, Bếp, Thu ngân...</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input placeholder="Nguyễn Văn A" value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="09xx..." value={formData.phoneNumber} 
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                 </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email (Dùng để đăng nhập)</Label>
                <Input type="email" placeholder="staff@example.com" value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Mật khẩu mặc định</Label>
                <Input value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vai trò</Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="RestaurantStaff">Phục vụ (Staff)</SelectItem>
                            <SelectItem value="Chef">Đầu bếp (Chef)</SelectItem>
                            <SelectItem value="Manager">Quản lý (Manager)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Làm việc tại chi nhánh</Label>
                    <Select value={formData.branchId} onValueChange={(val) => setFormData({...formData, branchId: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} Tạo tài khoản
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border w-fit">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <Input 
          placeholder="Tìm theo tên, email..." 
          className="border-0 focus-visible:ring-0 min-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">Đang tải...</TableCell></TableRow>
            ) : filteredStaffs.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">Chưa có nhân viên nào</TableCell></TableRow>
            ) : (
              filteredStaffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{staff.fullName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {staff.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                        staff.role === 'Chef' ? 'bg-red-50 text-red-700 border-red-200' : 
                        staff.role === 'Manager' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                        {staff.role === 'RestaurantStaff' ? 'Phục vụ' : staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {staff.branchName || '---'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(staff.id)} className="text-gray-400 hover:text-red-600">
                        <Trash className="w-4 h-4" />
                    </Button>
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