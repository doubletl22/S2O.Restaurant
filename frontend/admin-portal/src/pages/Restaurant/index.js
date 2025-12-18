import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Input,
  Typography,
  Modal,
  message,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RestaurantManagement = () => {
  // 1. Dữ liệu giả lập (Sau này sẽ gọi từ restaurantService.js)
  const [restaurants, setRestaurants] = useState([
    {
      id: "1",
      name: "Phở Lý Quốc Sư",
      owner: "Nguyễn Văn A",
      status: "Pending",
      plan: "Premium",
      createdAt: "2023-10-15",
    },
    {
      id: "2",
      name: "Pizza Home",
      owner: "Trần Thị B",
      status: "Active",
      plan: "Basic",
      createdAt: "2023-09-20",
    },
    {
      id: "3",
      name: "Bún Chả Obama",
      owner: "Lê Văn C",
      status: "Pending",
      plan: "Free",
      createdAt: "2023-10-18",
    },
  ]);

  // 2. Logic Phê duyệt nhà hàng (Onboarding)
  const handleApprove = (record) => {
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content: `Bạn có đồng ý cho phép nhà hàng "${record.name}" hoạt động trên hệ thống?`,
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: () => {
        const updatedData = restaurants.map((item) =>
          item.id === record.id ? { ...item, status: "Active" } : item
        );
        setRestaurants(updatedData);
        message.success(`Đã phê duyệt đối tác ${record.name} thành công!`);
      },
    });
  };

  // 3. Định nghĩa các cột của Bảng
  const columns = [
    {
      title: "Tên nhà hàng",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Text strong color="#1890ff">
          {text}
        </Text>
      ),
    },
    { title: "Chủ sở hữu", dataIndex: "owner", key: "owner" },
    {
      title: "Gói dịch vụ",
      dataIndex: "plan",
      key: "plan",
      render: (plan) => (
        <Tag color={plan === "Premium" ? "gold" : "blue"}>
          {plan.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "volcano" : "green"}>
          {status === "Pending" ? "CHỜ DUYỆT" : "ĐANG HOẠT ĐỘNG"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "Pending" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
              size="small"
            >
              Phê duyệt
            </Button>
          )}
          <Button icon={<EyeOutlined />} size="small">
            Chi tiết
          </Button>
          <Button icon={<StopOutlined />} danger size="small">
            Khóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={3}>Quản lý Đối tác & Tenant</Title>
        <Input
          placeholder="Tìm kiếm nhà hàng..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={restaurants}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};

export default RestaurantManagement;
