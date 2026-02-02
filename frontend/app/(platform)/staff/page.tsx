import { Clock, CheckCircle, AlertCircle, Timer } from 'lucide-react'

const orders = [
  {
    id: 'ORD001',
    table: 'Bàn 5',
    items: ['Phở bò tái', 'Nem rán x2'],
    time: '5 phút trước',
    status: 'pending',
  },
  {
    id: 'ORD002',
    table: 'Bàn 3',
    items: ['Cơm rang dương châu', 'Canh chua cá'],
    time: '8 phút trước',
    status: 'cooking',
  },
  {
    id: 'ORD003',
    table: 'Bàn 8',
    items: ['Bún chả', 'Chả giò'],
    time: '2 phút trước',
    status: 'pending',
  },
]

const statusConfig = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    icon: <Clock className="w-4 h-4" />,
  },
  cooking: {
    label: 'Đang nấu',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: <Timer className="w-4 h-4" />,
  },
  ready: {
    label: 'Sẵn sàng',
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
}

export default function StaffKitchen() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Bếp - KDS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Hệ thống hiển thị đơn hàng cho bếp
          </p>
        </div>
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Đang hoạt động
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig]
          
          return (
            <div
              key={order.id}
              className="p-5 rounded-2xl"
              style={{
                background: 'var(--card)',
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="bg-brand text-white px-3 py-1.5 rounded-lg text-sm font-bold"
                  >
                    {order.table}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {order.id}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {order.time}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2 mb-4">
                {order.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px dashed var(--line)' }}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status.color}`}>
                  {status.icon}
                  {status.label}
                </div>
                <button 
                  className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div 
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: 'var(--card)' }}
        >
          <AlertCircle className="w-12 h-12 mb-4" style={{ color: 'var(--muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
            Không có đơn hàng mới
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Các đơn hàng mới sẽ hiển thị tại đây
          </p>
        </div>
      )}
    </div>
  )
}
