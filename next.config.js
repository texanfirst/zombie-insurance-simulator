/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/zombie-insurance-simulator',
  images: {
    unoptimized: true,
  },
  // Ensure static export works
  distDir: 'out',
  trailingSlash: true,
}

module.exports = nextConfig 