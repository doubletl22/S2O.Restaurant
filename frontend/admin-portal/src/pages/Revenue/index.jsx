import React from "react";
import { Card, Statistic, Row, Col } from "antd";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Revenue = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue (VNĐ)",
        data: [15000000, 25000000, 18000000, 35000000, 28000000, 45000000],
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => val.toLocaleString() + "đ" },
      },
    },
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 700 }}>Revenue Overview</h2>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={150000000}
              suffix="đ"
              valueStyle={{ color: "#ff6b6b", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="This Month" value={45000000} suffix="đ" />
          </Card>
        </Col>
      </Row>

      <Card title="Revenue Growth Analysis" bordered={false}>
        <div style={{ height: "450px", width: "100%" }}>
          <Line data={data} options={options} />
        </div>
      </Card>
    </div>
  );
};

export default Revenue;
