'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/http' 

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  // Fetch Users
  const fetchUsers = async () => {
     try {
        const res = await api.get('/admin/users', { params: { page, size: 20, keyword } })
        setUsers(res.data.items || [])
     } catch(e) { console.error(e) }
  }

  useEffect(() => { fetchUsers() }, [page, keyword])

  return (
    <div className="p-6 space-y-6">
       <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold text-blue-900">Tài khoản Hệ thống</h1>
       </div>

       <div className="flex gap-2 bg-white p-2 rounded border w-fit">
           <Search className="w-5 h-5 text-gray-400 mt-2"/>
           <Input placeholder="Tìm email, tên..." value={keyword} onChange={e => setKeyword(e.target.value)} className="border-none shadow-none w-[300px]"/>
           <Button onClick={() => fetchUsers()}>Tìm kiếm</Button>
       </div>

       <div className="border rounded-lg bg-white shadow-sm">
           <Table>
               <TableHeader className="bg-gray-50"><TableRow>
                   <TableHead>User</TableHead>
                   <TableHead>Email</TableHead>
                   <TableHead>Vai trò</TableHead>
                   <TableHead>Tenant ID</TableHead>
                   <TableHead>Trạng thái</TableHead>
               </TableRow></TableHeader>
               <TableBody>
                   {users.map(u => (
                       <TableRow key={u.id}>
                           <TableCell className="font-medium flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                   <User className="w-4 h-4 text-gray-500"/>
                               </div>
                               {u.fullName || 'No Name'}
                           </TableCell>
                           <TableCell>{u.email}</TableCell>
                           <TableCell>
                               <Badge variant={u.role === 'SystemAdmin' ? 'default' : 'secondary'} className={u.role === 'SystemAdmin' ? 'bg-blue-600' : ''}>
                                   {u.role}
                               </Badge>
                           </TableCell>
                           <TableCell className="font-mono text-xs text-gray-500">{u.tenantId || 'System'}</TableCell>
                           <TableCell>{u.isActive ? <span className="text-green-600 font-bold text-xs">Active</span> : <span className="text-red-500 font-bold text-xs">Locked</span>}</TableCell>
                       </TableRow>
                   ))}
               </TableBody>
           </Table>
       </div>
    </div>
  )
}