/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic optimizations without problematic features
  compress: true,
  poweredByHeader: false,
  // Remove CSS optimization that's causing issues
  // experimental: {
  //   optimizeCss: true,
  // },
};

export default nextConfig;
