import React from "react";
import { Layout, Menu, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Cpu, Users, DollarSign } from "lucide-react";

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Danh sách các mục trên Menu Sidebar
  const menuItems = [
    {
      key: "/",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard tổng quan",
    },
    {
      key: "/restaurants",
      icon: <Store size={18} />,
      label: "Quản lý Nhà hàng",
    },
    { key: "/ai-config", icon: <Cpu size={18} />, label: "Cấu hình AI" },
    { key: "/users", icon: <Users size={18} />, label: "Quản lý Người dùng" },
    {
      key: "/revenue",
      icon: <DollarSign size={18} />,
      label: "Doanh thu SaaS",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <strong>S2O ADMIN</strong>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)} // Chuyển trang khi click
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}{" "}
          {/* Nơi nội dung các trang Dashboard, AIConfig... sẽ hiển thị */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
