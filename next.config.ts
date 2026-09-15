import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  output: 'standalone',

  serverExternalPackages: ['@prisma/adapter-mariadb', 'mariadb'],

  outputFileTracingIncludes: {
    '/*': [
      './node_modules/mariadb/**/*',
    ],
  },
};

export default nextConfig;
