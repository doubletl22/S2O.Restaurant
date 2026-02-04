import { GuestShell } from "@/components/guest/guest-shell";

export default function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { qrToken: string };
}) {
  return (
    <GuestShell qrToken={params.qrToken}>
      {children}
    </GuestShell>
  );
}
