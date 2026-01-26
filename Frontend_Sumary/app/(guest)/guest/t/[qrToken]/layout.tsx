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
    <div className="bg-gray-50 pb-24 max-w-md mx-auto relative shadow-2xl min-h-dvh">
      {children}
      <BottomNavV2 qrToken={qrToken} />
    </div>
  )
}