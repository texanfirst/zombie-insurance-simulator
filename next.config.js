/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1';
const isGitHubPages = !isVercel && process.env.NODE_ENV === 'production';

const nextConfig = {
  ...(isGitHubPages ? { output: 'export' } : {}),
  basePath: isGitHubPages ? '/zombie-insurance-simulator' : '',
  images: {
    unoptimized: true,
  },
  distDir: isGitHubPages ? 'out' : '.next',
  trailingSlash: true,
}

module.exports = nextConfig
