/** @type {import('next').NextConfig} */
const API_TARGET = process.env.API_PROXY_TARGET || "http://localhost:5000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
