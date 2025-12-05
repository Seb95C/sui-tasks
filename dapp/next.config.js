/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
    NEXT_PUBLIC_INDEXER_API_URL: process.env.NEXT_PUBLIC_INDEXER_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
  },
}

module.exports = nextConfig
