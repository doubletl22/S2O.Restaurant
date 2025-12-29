import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logoImg from "../../assets/Logo.png";

const Login = () => {
  const navigate = useNavigate();

  // State lưu dữ liệu nhập vào
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault(); // Chặn load lại trang

    // --- LOGIC KIỂM TRA ĐĂNG NHẬP GIẢ LẬP ---
    // Sau này sẽ thay bằng gọi API xuống Backend
    if (email === "admin@s2o.com" && password === "123456") {
      // 1. Lưu token giả vào localStorage (để lưu trạng thái đã đăng nhập)
      localStorage.setItem("accessToken", "mock-token-123456");
      localStorage.setItem("userRole", "ADMIN");

      // 2. Chuyển hướng vào trang chủ (Dashboard)
      navigate("/");
    } else {
      setError("Email hoặc mật khẩu không chính xác!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* Logo hệ thống S2O */}
          <img src={logoImg} alt="S2O Logo" style={{ height: "50px" }} />
          <h2>Admin Portal</h2>
          <p>Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Email quản trị</label>
            <input
              type="email"
              placeholder="admin@s2o.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
