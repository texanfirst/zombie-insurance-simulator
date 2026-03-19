/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/zombie-insurance-simulator' : '',
  images: {
    unoptimized: true,
  },
  distDir: isProd ? 'out' : '.next',
  trailingSlash: true,
}

module.exports = nextConfig 