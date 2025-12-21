import React from "react";
import { Layout, Menu, Avatar, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShopOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Map đường dẫn để active menu tương ứng
  const menuMap = {
    "/": "1",
    "/restaurants": "2",
    "/ai-config": "3",
    "/revenue": "4",
  };
  const selectedKey = menuMap[location.pathname] || "1";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        width={250}
        style={{
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "#ff6b6b", marginRight: "8px" }}>Admin</span>{" "}
          S2O
        </div>

        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShopOutlined />}>
            <Link to="/restaurants">Restaurants</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            <Link to="/ai-config">AI Config</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<BarChartOutlined />}>
            <Link to="/revenue">Revenue</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout style={{ marginLeft: 250, transition: "all 0.2s" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 99,
            width: "100%",
          }}
        >
          <Space size={16}>
            <span style={{ fontWeight: 500 }}>Admin Manager</span>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#ff6b6b" }}
            />
          </Space>
        </Header>

        <Content style={{ margin: "24px", overflow: "initial" }}>
          <div style={{ minHeight: "calc(100vh - 112px)" }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
