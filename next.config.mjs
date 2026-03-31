/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next-build",
  experimental: {
    webpackBuildWorker: false
  }
}

export default nextConfig
