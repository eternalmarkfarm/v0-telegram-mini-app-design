/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <--- САМОЕ ВАЖНОЕ: Говорит Next.js создать статику
  images: {
    unoptimized: true, // Нужно, чтобы картинки работали без сервера
  },
  // Если сайт будет открываться не в корне домена, раскомментируйте и измените:
  // basePath: '/v0-telegram-mini-app-design', 
};

export default nextConfig;
