/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true, // Generates better source maps
    reactStrictMode: true,
    output: 'export', // Ensures full static site export
    images: {
      unoptimized: true, // Disable image optimization for static export
      domains: ['api.travelwithghost.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api.travelwithghost.com',
          port: '',
          pathname: '/media/**',
        },
      ],
    },
    experimental: {
      appDir: false, // Disable the new App Router to prevent unexpected SSR behavior
    },
};
// module.exports = {
    // };
  
export default nextConfig;
