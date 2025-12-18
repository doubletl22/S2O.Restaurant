import React, { useState } from "react";
import { Slider, Card, Button, Typography, Row, Col, message } from "antd";
import { SaveOutlined, RobotOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AIConfig = () => {
  // Quản lý trạng thái các trọng số
  const [distanceWeight, setDistanceWeight] = useState(30);
  const [ratingWeight, setRatingWeight] = useState(70);

  const handleSave = () => {
    // Logic gửi dữ liệu về Backend S2O.API
    const configData = {
      distanceWeight: distanceWeight,
      ratingWeight: ratingWeight,
      updatedAt: new Date(),
    };

    console.log("Gửi lên hệ thống:", configData);
    message.success("Đã cập nhật cấu hình thuật toán cho Mobile App!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={
          <span>
            <RobotOutlined /> Cấu hình Thuật toán Gợi ý (AI)
          </span>
        }
        bordered={false}
        style={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Text strong>1. Trọng số Khoảng cách (Ưu tiên quán gần khách)</Text>
            <Slider
              min={0}
              max={100}
              value={distanceWeight}
              onChange={(value) => setDistanceWeight(value)}
              marks={{ 0: "0%", 100: "100%" }}
            />
          </Col>

          <Col span={24}>
            <Text strong>2. Trọng số Đánh giá (Ưu tiên quán nhiều sao)</Text>
            <Slider
              min={0}
              max={100}
              value={ratingWeight}
              onChange={(value) => setRatingWeight(value)}
              marks={{ 0: "0%", 100: "100%" }}
            />
          </Col>

          <Col span={24}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              onClick={handleSave}
              style={{ marginTop: 10 }}
            >
              Lưu và Áp dụng cho Mobile App
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AIConfig;
