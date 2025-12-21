import React from "react";
import { Table, Tag, Button, Card } from "antd";

const Restaurant = () => {
  const columns = [
    { title: "Tên nhà hàng", dataIndex: "name", key: "name" },
    { title: "Chủ sở hữu", dataIndex: "owner", key: "owner" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    { title: "Thao tác", render: () => <Button type="link">Phê duyệt</Button> },
  ];

  const data = [
    {
      key: "1",
      name: "Phở Lý Quốc Sư",
      owner: "Nguyễn Văn A",
      status: "Active",
    },
    { key: "2", name: "Pizza Home", owner: "Trần Thị B", status: "Pending" },
  ];

  return (
    <Card title="Quản lý đối tác nhà hàng">
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default Restaurant;
