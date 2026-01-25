import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import "./Login.css";
// Đảm bảo bạn có file logo ở đúng đường dẫn này, nếu không hãy đổi tên file hoặc xóa dòng này
import logoImg from "../../assets/Logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("1. Đang gửi đăng nhập...");

      const response = await adminApi.post("/api/auth/login", {
        email: email,
        password: password,
      });

      console.log("2. Server trả về:", response.data);


      const token = response.data.accessToken;
      const userData = response.data.user;

      if (token) {
        localStorage.setItem("accessToken", token);

        // Lưu thông tin user
        localStorage.setItem("userInfo", JSON.stringify({
            fullName: userData?.fullName || "Admin",
            email: userData?.email || email,
            role: userData?.roles?.[0] || "Admin",
            id: userData?.id
        }));

        console.log("3. Đăng nhập thành công! Chuyển trang...");
        navigate("/");
      } else {
        console.error("Lỗi: Không tìm thấy accessToken trong phản hồi");
        setError("Lỗi: Server không trả về Token.");
      }


    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response) {
        const msg = err.response.data.description || err.response.data.message || "Tên đăng nhập hoặc mật khẩu không đúng!";
        setError(msg);
      } else if (err.request) {
        setError("Không thể kết nối đến Server.");
      } else {
        setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* Logo của nhà hàng */}
          <img src={logoImg} alt="The Six Logo" className="login-logo" />
          <h2 className="login-title">Admin Portal</h2>
          <p className="login-subtitle">Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email quản trị</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@s2o.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
