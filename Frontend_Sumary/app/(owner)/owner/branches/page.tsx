'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, MoreHorizontal, MapPin, 
  Phone, Building, Loader2, Edit, Trash 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { branchService, BranchDto } from '@/services/branch.service'

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State Modal
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: ''
  })

  // 1. Load dữ liệu
  const fetchBranches = async () => {
    try {
      setLoading(true)
      const data = await branchService.getAll()
      // Xử lý nếu backend trả về dạng { value: [] } hoặc []
      const list = Array.isArray(data) ? data : (data as any).value || [];
      setBranches(list)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải danh sách chi nhánh")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  // 2. Xử lý Submit (Tạo mới hoặc Cập nhật)
  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      toast.error("Tên và địa chỉ là bắt buộc")
      return
    }

    try {
      setIsSubmitting(true)
      if (editingId) {
        // Update
        await branchService.update(editingId, formData)
        toast.success("Cập nhật chi nhánh thành công")
      } else {
        // Create
        await branchService.create(formData)
        toast.success("Tạo chi nhánh thành công")
      }
      
      setIsOpen(false)
      fetchBranches() // Reload
      resetForm()
    } catch (error: any) {
        const msg = error.response?.data?.detail || "Có lỗi xảy ra";
        toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (branch: BranchDto) => {
    setEditingId(branch.id)
    setFormData({
      name: branch.name,
      address: branch.address,
      phoneNumber: branch.phoneNumber
    })
    setIsOpen(true)
  }
  
  const handleDelete = async (id: string) => {
      if(!confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;
      try {
          await branchService.delete(id);
          toast.success("Đã xóa chi nhánh");
          fetchBranches();
      } catch (e) {
          toast.error("Không thể xóa chi nhánh đang hoạt động");
      }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: '', address: '', phoneNumber: '' })
  }

  // Filter local
  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Chi nhánh</h1>
          <p className="text-muted-foreground">Danh sách các cơ sở của nhà hàng</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên chi nhánh</Label>
                <Input placeholder="Ví dụ: Cơ sở Quận 1" value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Địa chỉ</Label>
                <Input placeholder="123 Đường ABC..." value={formData.address} 
                   onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Số điện thoại</Label>
                <Input placeholder="0909..." value={formData.phoneNumber} 
                   onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} 
                {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border w-fit min-w-75">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <Input 
          placeholder="Tìm theo tên, địa chỉ..." 
          className="border-0 focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</TableCell></TableRow>
            ) : filteredBranches.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Chưa có chi nhánh nào</TableCell></TableRow>
            ) : (
              filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="font-medium text-gray-900">{branch.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {branch.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> {branch.phoneNumber || '---'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Hoạt động
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(branch)}>
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(branch.id)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" /> Xóa chi nhánh
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