import React from "react";
import { Slider, Card, Button, Typography, Space } from "antd";

const { Text } = Typography;

const AIConfig = () => {
  return (
    <Card title="Cấu hình thuật toán AI" style={{ maxWidth: 600 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Text strong>Trọng số Khoảng cách</Text>
          <Slider defaultValue={30} />
        </div>
        <div>
          <Text strong>Trọng số Đánh giá (Rating)</Text>
          <Slider defaultValue={70} />
        </div>
        <Button type="primary">Lưu cấu hình</Button>
      </Space>
    </Card>
  );
};

export default AIConfig;
