import { GuestShell } from "@/components/guest/guest-shell";

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await params;
  return (
    <GuestShell qrToken={qrToken}>
      {children}
    </GuestShell>
  );
}
