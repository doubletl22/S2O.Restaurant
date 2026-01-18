import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <ChefHat className="mb-4 h-20 w-20 text-orange-500" />
      <h1 className="mb-8 text-4xl font-bold">S2O Restaurant System</h1>
      <div className="flex gap-4">
        <Link 
          href="/staff/login" 
          className="rounded bg-blue-600 px-6 py-3 font-bold hover:bg-blue-700 transition"
        >
          Đăng nhập Nhân viên (Bếp/Bar)
        </Link>
      </div>
    </div>
  );
}