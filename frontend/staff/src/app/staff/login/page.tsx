"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { jwtDecode } from "jwt-decode"; 

export default function StaffLogin() {
  const [email, setEmail] = useState("bep@s2o.com"); // Điền sẵn cho dễ test
  const [password, setPassword] = useState("P@ssword1");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API Login
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;

      // 2. Lưu Token
      localStorage.setItem("token", token);

      // 3. Giải mã Token lấy BranchId
      const decoded: any = jwtDecode(token);
      // Lưu ý: Claim custom thường viết thường trong token đã decode
      const branchId = decoded.branch_id || decoded.BranchId; 

      if (!branchId) {
        alert("Lỗi: Tài khoản này không thuộc chi nhánh nào!");
        setLoading(false);
        return;
      }
      
      localStorage.setItem("branchId", branchId);
      
      // 4. Chuyển hướng
      router.push("/staff/orders");

    } catch (err: any) {
      console.error(err);
      alert("Đăng nhập thất bại! Kiểm tra lại Email/Pass.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">S2O Staff</h1>
          <p className="text-gray-500">Cổng thông tin nhân viên</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}