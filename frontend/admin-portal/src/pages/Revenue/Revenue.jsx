import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Revenue.css";

const data = [
  { name: "T1", uv: 4000 },
  { name: "T2", uv: 3000 },
  { name: "T3", uv: 2000 },
  { name: "T4", uv: 2780 },
  { name: "T5", uv: 1890 },
  { name: "T6", uv: 2390 },
];

const Revenue = () => {
  return (
    <div className="page-container">
      <h2>Báo cáo Doanh thu</h2>
      <div className="chart-large">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uv" fill="#8884d8" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Revenue;
    