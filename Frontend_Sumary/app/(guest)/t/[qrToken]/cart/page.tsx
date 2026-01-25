export default function CartPage() {
  return (
    <div className="px-4 pt-6">
      <h1 
        className="text-xl font-bold"
        style={{ color: 'var(--text)' }}
      >
        Giỏ hàng
      </h1>
      <p 
        className="text-sm mt-1"
        style={{ color: 'var(--muted)' }}
      >
        Chưa có món nào trong giỏ
      </p>
    </div>
  )
}
