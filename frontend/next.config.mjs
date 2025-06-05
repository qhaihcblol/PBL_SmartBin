/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '172.20.10.4',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://0.0.0.0:3000',
    'http://172.20.10.4:3000', // 👉 nên thêm luôn IP nếu dùng thiết bị khác truy cập
  ],
}

export default nextConfig
