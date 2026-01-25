/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["localhost:3000", "172.29.0.1:3000", "172.29.0.1"],
}

export default nextConfig
