import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { ShopOutlined, UserOutlined } from "@ant-design/icons";

const Dashboard = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Tổng quan hệ thống S2O</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Tổng nhà hàng (Tenants)"
              value={128}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Người dùng hoạt động"
              value={1560}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
