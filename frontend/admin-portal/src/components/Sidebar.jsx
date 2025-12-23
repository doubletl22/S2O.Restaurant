import React from "react";
import {
  LayoutDashboard,
  Store,
  Users,
  DollarSign,
  Settings,
  BrainCircuit,
  ChefHat,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    {
      category: "Bảng Điều Khiển",
      items: [{ name: "Tổng quan", icon: LayoutDashboard, path: "/" }],
    },
    {
      category: "Quản trị viên",
      items: [
        { name: "Quản lý nhà hàng", icon: Store, path: "/restaurants" },
        { name: "Quản lý doanh thu", icon: DollarSign, path: "/revenue" },
        { name: "Quản lý người dùng", icon: Users, path: "/users" },
        { name: "Cấu hình AI", icon: BrainCircuit, path: "/ai-config" },
      ],
    },
    {
      category: "Hệ thống",
      items: [
        { name: "Món ăn", icon: ChefHat, path: "/products" },
        { name: "Cài đặt", icon: Settings, path: "/settings" },
      ],
    },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">FS</div>
        <h1>FoodScan</h1>
      </div>
      <div className="menu-container">
        {menuItems.map((section, index) => (
          <div key={index} className="menu-section">
            <h3 className="menu-title">{section.category}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`menu-item ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Sidebar;
