'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrderStatus, StaffOrderDto } from '@/lib/types'
import { staffService } from '@/services/staff.service'

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian'
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function toLocalDateKey(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toMonthKey(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function formatChartLabel(key: string, mode: 'day' | 'month') {
  if (!key) return ''
  if (mode === 'month') {
    const [year, month] = key.split('-')
    return `${month}/${year}`
  }

  const [year, month, day] = key.split('-')
  return `${day}/${month}`
}

function getOrderCreatedAt(order: StaffOrderDto) {
  return String((order as any).createdAtUtc || order.createdAt || order.createdOn || '')
}

function resolveInvoiceCode(order: StaffOrderDto) {
  const orderNumber = String(order.orderNumber || '').trim()
  return orderNumber ? `#${orderNumber}` : `#${order.id.substring(0, 8)}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function resolveTableLabel(order: StaffOrderDto) {
  const tableName = String(order.tableName || '').trim()
  if (tableName && tableName.toLowerCase() !== 'mang về') {
    return tableName
  }

  if (order.tableId && order.tableId !== 'Mang về') {
    return `Bàn #${order.tableId.substring(0, 8)}`
  }

  return 'Mang về'
}

export default function OrderHistoryPage() {
  const [historyOrders, setHistoryOrders] = useState<StaffOrderDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date().toISOString()))
  const [selectedInvoice, setSelectedInvoice] = useState<StaffOrderDto | null>(null)
  const [chartMode, setChartMode] = useState<'day' | 'month'>('day')
  const [chartFromDate, setChartFromDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return toLocalDateKey(date.toISOString())
  })
  const [chartToDate, setChartToDate] = useState(() => toLocalDateKey(new Date().toISOString()))

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        const res: any = await staffService.getOrders()
        if (!res?.isSuccess || !Array.isArray(res?.value)) {
          setHistoryOrders([])
          return
        }

        const paid = res.value.filter((o: StaffOrderDto) =>
          o.status === OrderStatus.Served ||
          o.status === OrderStatus.Completed
        )

        paid.sort((a: StaffOrderDto, b: StaffOrderDto) => {
          const at = new Date((a as any).createdAtUtc || a.createdAt || a.createdOn).getTime()
          const bt = new Date((b as any).createdAtUtc || b.createdAt || b.createdOn).getTime()
          return bt - at
        })

        setHistoryOrders(paid)
      } catch {
        setHistoryOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
    const timer = setInterval(loadHistory, 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredOrders = useMemo(() => {
    if (!selectedDate) return historyOrders
    return historyOrders.filter((order) => toLocalDateKey(getOrderCreatedAt(order)) === selectedDate)
  }, [historyOrders, selectedDate])

  const totalPaidAmount = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [filteredOrders]
  )

  const totalBranchRevenue = useMemo(
    () => historyOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [historyOrders]
  )

  const chartPoints = useMemo(() => {
    const fromTs = chartFromDate
      ? new Date(`${chartFromDate}T00:00:00`).getTime()
      : Number.NEGATIVE_INFINITY
    const toTs = chartToDate
      ? new Date(`${chartToDate}T23:59:59.999`).getTime()
      : Number.POSITIVE_INFINITY

    const grouped = new Map<string, number>()

    historyOrders.forEach((order) => {
      const createdAt = getOrderCreatedAt(order)
      const createdDate = new Date(createdAt)
      const ts = createdDate.getTime()
      if (Number.isNaN(ts)) return
      if (ts < fromTs || ts > toTs) return

      const key = chartMode === 'month' ? toMonthKey(createdAt) : toLocalDateKey(createdAt)
      if (!key) return

      grouped.set(key, (grouped.get(key) || 0) + Number(order.totalAmount || 0))
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({
        key,
        label: formatChartLabel(key, chartMode),
        total,
      }))
  }, [historyOrders, chartFromDate, chartToDate, chartMode])

  const maxChartValue = useMemo(
    () => chartPoints.reduce((max, item) => Math.max(max, item.total), 0),
    [chartPoints]
  )

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[color:var(--text)]">
              Lịch sử thanh toán
            </h1>
            <p className="text-sm mt-1 text-[color:var(--muted)]">
              Các hóa đơn đã thanh toán
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label htmlFor="history-date" className="text-sm text-[color:var(--muted)]">
                Ngày:
              </label>
              <input
                id="history-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <p className="text-sm mt-1 text-[color:var(--muted)]">
              Tổng doanh thu theo ngày: <span className="font-semibold">{formatPrice(totalPaidAmount)}</span>
            </p>
            <p className="text-sm mt-1 text-[color:var(--muted)]">
              Tổng doanh thu cả chi nhánh: <span className="font-semibold">{formatPrice(totalBranchRevenue)}</span>
            </p>
          </div>

          {/* Orders List */}
          <div className="max-h-[62vh] overflow-y-auto pr-2">
            <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-sm text-[color:var(--muted)]">
            Đang tải lịch sử thanh toán...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-sm text-[color:var(--muted)]">
            Chưa có hóa đơn nào đã thanh toán trong ngày đã chọn.
          </div>
        ) : filteredOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--card)] shadow-[var(--shadow)]"
          >
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(34,197,94,0.12)]"
            >
              <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[color:var(--text)]">
                  {resolveTableLabel(order)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(34,197,94,0.12)] text-[#22c55e]">
                  Đã thanh toán
                </span>
              </div>
              <p className="text-sm mt-1 text-[color:var(--muted)]">
                {(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} món • {formatTime((order as any).createdAtUtc || order.createdAt || order.createdOn)}
              </p>
            </div>

            {/* Total */}
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-bold text-lg text-[color:var(--text)]">
                {formatPrice(Number(order.totalAmount || 0))}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedInvoice(order)}
              >
                Chi tiết hóa đơn
              </Button>
            </div>
          </div>
        ))}
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="rounded-2xl border bg-[var(--card)] shadow-[var(--shadow)] p-4 xl:sticky xl:top-6">
          <h2 className="text-base font-semibold text-[color:var(--text)]">Biểu đồ doanh thu</h2>
          <p className="text-xs text-[color:var(--muted)] mt-1">Lọc theo ngày/tháng tùy chọn</p>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <label className="text-xs text-[color:var(--muted)]">Kiểu biểu đồ</label>
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as 'day' | 'month')}
              aria-label="Kiểu biểu đồ doanh thu"
              title="Kiểu biểu đồ doanh thu"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
            </select>

            <label className="text-xs text-[color:var(--muted)]">Từ ngày</label>
            <input
              type="date"
              value={chartFromDate}
              onChange={(e) => setChartFromDate(e.target.value)}
              aria-label="Từ ngày"
              title="Từ ngày"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            />

            <label className="text-xs text-[color:var(--muted)]">Đến ngày</label>
            <input
              type="date"
              value={chartToDate}
              onChange={(e) => setChartToDate(e.target.value)}
              aria-label="Đến ngày"
              title="Đến ngày"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>

          <div className="mt-4">
            {chartPoints.length === 0 ? (
              <p className="text-xs text-[color:var(--muted)]">Không có dữ liệu trong khoảng thời gian đã chọn.</p>
            ) : (
              <>
                <div className="border rounded-md p-2 bg-background/40">
                  <svg viewBox={`0 0 ${Math.max(1, chartPoints.length * 34)} 120`} className="w-full h-40" role="img" aria-label="Biểu đồ doanh thu">
                    {chartPoints.map((point, idx) => {
                      const max = maxChartValue > 0 ? maxChartValue : 1
                      const barHeight = Math.max(8, Math.round((point.total / max) * 92))
                      const x = idx * 34 + 6
                      const y = 100 - barHeight
                      return (
                        <g key={point.key}>
                          <title>{`${point.label}: ${formatPrice(point.total)}`}</title>
                          <rect x={x} y={y} width={22} height={barHeight} rx={3} fill="#f97316" />
                          <text x={x + 11} y={114} textAnchor="middle" fontSize="7" fill="#6b7280">
                            {point.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
                <p className="mt-2 text-xs text-[color:var(--muted)]">Tổng trong biểu đồ: <span className="font-semibold">{formatPrice(chartPoints.reduce((sum, p) => sum + p.total, 0))}</span></p>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm">
                <p>
                  <span className="font-semibold">Mã hóa đơn:</span> Hóa đơn {resolveInvoiceCode(selectedInvoice)}
                </p>
                <p>
                  <span className="font-semibold">Bàn:</span> {resolveTableLabel(selectedInvoice)}
                </p>
                <p>
                  <span className="font-semibold">Thời điểm:</span> {formatDateTime(getOrderCreatedAt(selectedInvoice))}
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left">Món</th>
                      <th className="px-3 py-2 text-right">SL</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, idx) => {
                      const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0)
                      return (
                        <tr key={`${item.id || item.productId}-${idx}`} className="border-t">
                          <td className="px-3 py-2">
                            <div className="font-medium">{item.productName}</div>
                            {item.note && <div className="text-xs text-muted-foreground">Ghi chú: {item.note}</div>}
                          </td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatPrice(Number(item.unitPrice || 0))}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatPrice(lineTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-right text-base">
                <span className="font-semibold">Tổng hóa đơn: </span>
                <span className="font-bold">{formatPrice(Number(selectedInvoice.totalAmount || 0))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
