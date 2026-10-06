/** @type {import('next').NextConfig} */
// PWA: 서비스워커 없이 manifest만 쓴다 (키오스크 화면에서만 홈 화면 추가).
// 예전 @ducanh2912/next-pwa는 Next 16(Turbopack) 빌드에서 동작하지 않아 제거했다.
const nextConfig = {
  turbopack: {},
};

export default nextConfig;
