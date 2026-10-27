/** @type {import('next').NextConfig} */
// PWA: 서비스워커 없이 manifest만 쓴다 (키오스크 화면에서만 홈 화면 추가).
// 예전 @ducanh2912/next-pwa는 Next 16(Turbopack) 빌드에서 동작하지 않아 제거했다.
const nextConfig = {
  turbopack: {},
  // 에러 기록에 '어느 배포 버전에서 났는지' 남기려고 커밋 앞 7자리를 브라우저 코드에도 넣는다 (Vercel이 빌드 때 채워 줌)
  env: { NEXT_PUBLIC_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) },
  // 화면 테스트(npm run test:e2e)는 개발 서버와 따로 빌드 폴더를 쓴다 (동시에 켜 둬도 충돌하지 않게)
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;
