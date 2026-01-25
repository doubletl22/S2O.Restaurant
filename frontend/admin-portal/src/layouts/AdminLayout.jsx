import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { User, LogOut, Key, Edit, ChevronDown } from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="welcome-text">
            Xin chào!{" "}
            <span style={{ color: "#3B82F6", fontWeight: "bold" }}>Admin</span>
          </div>

          <div
            className="user-profile"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar">
              <User size={18} />
            </div>
            <span>Admin</span>
            <ChevronDown size={16} style={{ marginLeft: 5, opacity: 0.6 }} />

            {showDropdown && (
              <div
                className="dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown-item">
                  <Edit size={16} /> <span>Edit Profile</span>
                </div>
                <div className="dropdown-item">
                  <Key size={16} /> <span>Change Password</span>
                </div>

                <div className="menu-divider"></div>

                <div className="dropdown-item text-red" onClick={handleLogout}>
                  <LogOut size={16} /> <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
