<<<<<<< HEAD
import { redirect } from "next/navigation";

export default function MenuRedirect({ params }: { params: { qrToken: string } }) {
  redirect(`/t/${params.qrToken}`);
}
=======
import { redirect } from "next/navigation";

export default function MenuRedirect({ params }: { params: { qrToken: string } }) {
  redirect(`/t/${params.qrToken}`);
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
