'use client'

import { useEffect, useState } from 'react'
import { BellRing, Clock3, Table2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getBranchId } from '@/lib/jwt'
import { OrderStatus, StaffOrderDto } from '@/lib/types'
import { staffService } from '@/services/staff.service'
import { tableService } from '@/services/table.service'

type BranchTable = {
  id: string
  name: string
  capacity?: number
  isActive?: boolean
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Không rõ thời gian'
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function TablesPage() {
  const [tables, setTables] = useState<BranchTable[]>([])
  const [orders, setOrders] = useState<StaffOrderDto[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const branchId = getBranchId()

      try {
        const ordersRes = await staffService.getOrders()
        const primaryTablesRes = await tableService.getByBranch(branchId)

        const normalizeTables = (payload: any) => Array.isArray(payload?.value)
          ? payload.value
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : []

        let tableList = normalizeTables(primaryTablesRes)

        if (tableList.length === 0) {
          const fallbackTablesRes = await tableService.getAll()
          tableList = normalizeTables(fallbackTablesRes)
        }

        setTables(
          tableList.map((table: any) => ({
            id: String(table.id),
            name: String(table.name || 'Không rõ tên bàn'),
            capacity: typeof table.capacity === 'number' ? table.capacity : undefined,
            isActive: typeof table.isActive === 'boolean' ? table.isActive : undefined,
          }))
        )

        if ((ordersRes as any)?.isSuccess && Array.isArray((ordersRes as any).value)) {
          setOrders((ordersRes as any).value)
        } else {
          setOrders([])
        }
      } catch {
        setTables([])
        setOrders([])
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getOrdersForTable = (tableId: string) => orders.filter((order) => order.tableId === tableId)

  const getTableState = (tableId: string) => {
    const relatedOrders = getOrdersForTable(tableId)
    const pendingCount = relatedOrders.filter((order) => order.status === OrderStatus.Pending).length
    const activeCount = relatedOrders.filter((order) => order.status === OrderStatus.Confirmed || order.status === OrderStatus.Cooking).length

    if (activeCount > 0) {
      return {
        label: 'Có khách',
        badgeClassName: 'bg-blue-50 text-blue-700 border-blue-200',
        cardClassName: 'border-blue-200 bg-blue-50/40',
      }
    }

    if (pendingCount > 0) {
      return {
        label: `${pendingCount} đơn mới`,
        badgeClassName: 'bg-red-50 text-red-700 border-red-200',
        cardClassName: 'border-red-200 bg-red-50/40',
      }
    }

    return {
      label: 'Trống',
      badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cardClassName: 'border-emerald-200 bg-emerald-50/40',
    }
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Table2 className="h-6 w-6 text-primary" />
            Các bàn trong chi nhánh
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách bàn hiện có và trạng thái đơn theo chi nhánh của bạn.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {tables.length} bàn
        </Badge>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            Chưa lấy được danh sách bàn của chi nhánh.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            const tableState = getTableState(table.id)
            const relatedOrders = getOrdersForTable(table.id)
            const latestOrder = relatedOrders
              .slice()
              .sort((left, right) => {
                const leftTime = new Date((left as any).createdAtUtc || left.createdAt || left.createdOn).getTime()
                const rightTime = new Date((right as any).createdAtUtc || right.createdAt || right.createdOn).getTime()
                return rightTime - leftTime
              })[0]

            return (
              <Card key={table.id} className={tableState.cardClassName}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{table.name}</h2>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {table.capacity ? `${table.capacity} ghế` : 'Chưa có sức chứa'}
                        </span>
                        {table.isActive === false && <span>Tạm ẩn</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className={tableState.badgeClassName}>
                      {tableState.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {latestOrder ? (
                    <>
                      <p className="font-medium text-foreground">
                        Đơn gần nhất: {String(latestOrder.orderNumber || '').trim() ? `#${latestOrder.orderNumber}` : `#${latestOrder.id.substring(0, 8)}`}
                      </p>
                      <p className="text-muted-foreground inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {formatTime((latestOrder as any).createdAtUtc || latestOrder.createdAt || latestOrder.createdOn)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Chưa có đơn nào trên bàn này.</p>
                  )}

                  <p className="text-muted-foreground inline-flex items-center gap-1">
                    <BellRing className="h-4 w-4" />
                    Tổng số đơn liên quan: {relatedOrders.length}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
