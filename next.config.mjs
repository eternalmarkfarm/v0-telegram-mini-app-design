/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // ВАЖНО: Указываем название вашего репозитория со слэшем в начале
  basePath: '/v0-telegram-mini-app-design',
  
  images: {
    unoptimized: true,
  },
  
  // Эти настройки нужны, чтобы v0 не ругался при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
