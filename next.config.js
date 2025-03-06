/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/zombie-insurance-simulator',
  images: {
    unoptimized: true,
  },
  // Disable server components since we're exporting static HTML
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig 