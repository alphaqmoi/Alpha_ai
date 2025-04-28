/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable GitHub backup integration
  env: {
    GITHUB_REPO: 'simtwov/Alpha',
    BACKUP_FREQUENCY: '6', // hours
    AUTO_TRAINING: 'true',
    MODEL_DIR: 'Qmoi',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow server components to access the file system
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path', 'child_process'],
  },
};

export default nextConfig;
