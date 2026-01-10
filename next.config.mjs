/** @type {import('next').NextConfig} */

// Проверяем: если сборка идет на GitHub Actions, то true. Иначе (на Vercel/локально) - false.
const isGithubActions = process.env.GITHUB_ACTIONS || false;

// Задаем имя папки только если мы на GitHub
let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
  const repo = '/v0-telegram-mini-app-design'; // Ваше название репозитория
  assetPrefix = repo;
  basePath = repo;
}

const nextConfig = {
  output: 'export',
  
  // Применяем настройки динамически
  assetPrefix: assetPrefix,
  basePath: basePath,
  
  images: {
    unoptimized: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
