'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Copy, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { branchService, BranchDto } from '@/services/branch.service'
import { tableService, TableDto } from '@/services/table.service'

export default function QrCodesPage() {
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [tables, setTables] = useState<TableDto[]>([])

  useEffect(() => {
    branchService.getAll().then(data => {
        setBranches(data || [])
        if(data && data.length > 0) setSelectedBranchId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if(!selectedBranchId) return;
    tableService.getByBranch(selectedBranchId).then(data => setTables(Array.isArray(data) ? data : []))
  }, [selectedBranchId])

  // Hàm tạo link
  const getOrderLink = (tableId: string) => {
      // Giả sử domain local hoặc production
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      return `${baseUrl}/guest/t/${tableId}`; // Link khách truy cập
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép link")
  }

  const printQr = () => {
      window.print();
  }

  return (
    <div className="p-6 space-y-6 print:p-0">
       <div className="flex justify-between items-center print:hidden">
           <div>
               <h1 className="text-2xl font-bold text-gray-800">Mã QR Gọi Món</h1>
               <p className="text-sm text-gray-500">In mã này dán lên bàn để khách quét</p>
           </div>
           <div className="flex items-center gap-2">
               <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                   <SelectTrigger className="w-50"><SelectValue placeholder="Chọn chi nhánh"/></SelectTrigger>
                   <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
               </Select>
               <Button variant="outline" onClick={printQr}><Printer className="mr-2 h-4 w-4"/> In tất cả</Button>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {tables.map(table => {
               const link = getOrderLink(table.id);
               return (
                   <Card key={table.id} className="flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                       <CardHeader className="pb-2">
                           <CardTitle className="text-xl font-bold text-orange-600">{table.name}</CardTitle>
                           <p className="text-xs text-gray-400 uppercase tracking-widest">Scan to Order</p>
                       </CardHeader>
                       <CardContent className="pb-2">
                           {/* Placeholder QR Code. Nếu có thư viện thì dùng <QRCode value={link} /> */}
                           <div className="bg-white p-2 border rounded-lg inline-block">
                               <img 
                                 src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`} 
                                 alt="QR Code" 
                                 className="w-32 h-32"
                               />
                           </div>
                       </CardContent>
                       <CardFooter className="flex flex-col gap-2 w-full pt-0 print:hidden">
                           <div className="text-xs text-gray-400 truncate w-full px-2 bg-gray-50 py-1 rounded">
                               {link}
                           </div>
                           <Button variant="ghost" size="sm" className="w-full text-blue-600" onClick={() => copyToClipboard(link)}>
                               <Copy className="mr-2 h-3 w-3"/> Copy Link
                           </Button>
                       </CardFooter>
                   </Card>
               )
           })}
           {tables.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">Không có bàn nào để tạo QR.</div>}
       </div>
    </div>
  )
}