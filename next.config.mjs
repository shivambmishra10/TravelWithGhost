/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    images: {
      unoptimized: true,
      domains: ['api.travelwithghost.com', 'localhost'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api.travelwithghost.com',
          port: '',
          pathname: '/media/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8000',
          pathname: '/media/**',
        },
      ],
    },
};

export default nextConfig;
