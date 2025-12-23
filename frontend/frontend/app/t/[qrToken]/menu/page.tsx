import { redirect } from "next/navigation";

export default function MenuRedirect({ params }: { params: { qrToken: string } }) {
  redirect(`/t/${params.qrToken}`);
}
