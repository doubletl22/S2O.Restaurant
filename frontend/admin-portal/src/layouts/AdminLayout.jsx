import React from "react";
import Sidebar from "../components/Sidebar";
import { User } from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="welcome-text">
            Chào buổi chiều! <span style={{ color: "#3B82F6" }}>Admin</span>
          </div>
          <div className="user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <span>John Doe</span>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};
export default AdminLayout;
