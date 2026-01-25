import React from "react"
import { BottomNav } from '@/components/guest/bottom-nav'

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ qrToken: string }>
}) {
  const { qrToken } = await params

  return (
    <div 
      className="min-h-screen max-w-[420px] mx-auto relative"
      style={{ background: 'var(--bg)' }}
    >
      <div style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom))' }}>
        {children}
      </div>
      <BottomNav qrToken={qrToken} />
    </div>
  )
}
