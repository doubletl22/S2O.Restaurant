import React from "react"
import { BottomNavV2 } from '@/components/guest/bottom-nav-v2'

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
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg)' }}
    >
      {children}
      <BottomNavV2 qrToken={qrToken} />
    </div>
  )
}
