export default function TrackingPage() {
  return (
    <div className="px-4 pt-6">
      <h1 
        className="text-xl font-bold"
        style={{ color: 'var(--text)' }}
      >
        Theo dõi đơn hàng
      </h1>
      <p 
        className="text-sm mt-1"
        style={{ color: 'var(--muted)' }}
      >
        Chưa có đơn hàng nào
      </p>
    </div>
  )
}
