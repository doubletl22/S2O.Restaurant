import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  ArrowUpOutlined,
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;

const Dashboard = () => {
  // Dữ liệu giả lập cho biểu đồ tăng trưởng Tenant
  const data = {
    labels: [
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Nhà hàng mới",
        data: [12, 19, 15, 22, 30, 45],
        borderColor: "#1890ff",
        backgroundColor: "#1890ff",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: "10px" }}>
      <AntTitle level={2}>Tổng quan hệ thống SaaS</AntTitle>

      {/* Thẻ thống kê nhanh */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Tổng Nhà hàng (Tenants)"
              value={128}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Người dùng hệ thống"
              value={1560}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Doanh thu tháng này"
              value={45000000}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ giám sát hoạt động */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Biểu đồ tăng trưởng đối tác mới" bordered={false}>
            <div style={{ height: "350px" }}>
              <Line data={data} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
