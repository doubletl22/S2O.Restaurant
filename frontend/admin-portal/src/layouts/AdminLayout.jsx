import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
// Import bộ icon đầy đủ cho giống mẫu
import {
  User,
  ChevronDown,
  LogOut,
  Globe,
  MessageSquare,
  AlignJustify,
  Edit3,
  Key,
  Wallet,
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Bạn có muốn đăng xuất không?")) {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar giữ nguyên bên trái */}
      <Sidebar />

      <div className="main-wrapper">
        {/* Header chính */}
        <header className="header">
          {/* Bên trái: Giữ nguyên hoặc để trống */}
          <div className="header-left">
            {/* Bạn có thể để Breadcrumb hoặc Lời chào ở đây */}
          </div>

          {/* Bên phải: Các nút chức năng + Profile */}
          <div className="header-right">
            {/* 1. Nút Ngôn ngữ (Giống mẫu) */}
            <button className="icon-btn language-btn">
              <Globe size={18} /> <span>Tiếng Anh</span>
            </button>

            {/* 2. Nút Chat & Menu (Giống mẫu) */}
            <button className="icon-btn square-btn">
              <MessageSquare size={20} />
            </button>
            <button className="icon-btn square-btn">
              <AlignJustify size={20} />
            </button>

            {/* 3. Phần User Profile (Quan trọng nhất) */}
            <div className="profile-container">
              <button
                className="user-info-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar-small">
                  <User size={20} color="white" />
                </div>
                <div className="text-info">
                  <span className="sub-text">Xin Chào</span>
                  <span className="main-text">John Doe</span>
                </div>
                <ChevronDown size={16} className="arrow-icon" />
              </button>

              {/* --- MENU THẢ XUỐNG (Dropdown) --- */}
              {isDropdownOpen && (
                <div className="custom-dropdown">
                  {/* Phần đầu: Avatar to + Thông tin */}
                  <div className="dropdown-header-profile">
                    <div className="big-avatar">
                      <User size={40} color="#555" />
                      <div className="edit-badge">
                        <Edit3 size={10} color="white" />
                      </div>
                    </div>
                    <h3>John Doe</h3>
                    <p className="email">admin@example.com</p>
                    <p className="phone">+84 901 234 567</p>
                    <div className="balance">0,00 VNĐ</div>
                  </div>

                  {/* Phần thân: Các nút bấm */}
                  <ul className="dropdown-list">
                    <li>
                      <button>
                        <Edit3 size={18} /> Chỉnh Sửa Hồ Sơ
                      </button>
                    </li>
                    <li>
                      <button>
                        <Key size={18} /> Thay Đổi Mật Khẩu
                      </button>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="logout-item">
                        <LogOut size={18} /> Đăng Xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
