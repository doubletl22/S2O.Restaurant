import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react'

const stats = [
  {
    label: 'Doanh thu hôm nay',
    value: '12,500,000đ',
    change: '+12%',
    isUp: true,
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: 'Đơn hàng',
    value: '156',
    change: '+8%',
    isUp: true,
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    label: 'Khách hàng mới',
    value: '24',
    change: '-3%',
    isUp: false,
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Tỷ lệ hoàn thành',
    value: '94%',
    change: '+2%',
    isUp: true,
    icon: <TrendingUp className="w-5 h-5" />,
  },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Xin chào! Đây là tổng quan hoạt động nhà hàng hôm nay.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--card)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'rgba(249, 115, 22, 0.1)',
                  color: '#f97316'
                }}
              >
                {stat.icon}
              </div>
              <div 
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.isUp 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {stat.isUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stat.value}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div 
        className="p-6 rounded-2xl"
        style={{
          background: 'var(--card)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Thêm món mới', href: '/admin/menu/new' },
            { label: 'Xem đặt bàn', href: '/admin/bookings' },
            { label: 'Quản lý bàn', href: '/admin/tables' },
            { label: 'Báo cáo', href: '/admin/reports' },
          ].map((action) => (
            <button
              key={action.label}
              className="p-4 rounded-xl text-sm font-medium transition-colors hover:bg-(--bg)"
              style={{ 
                border: '1px dashed var(--line)',
                color: 'var(--text)'
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
