/** @type {import('next').NextConfig} */
// const nextConfig = {

// };

// export default nextConfig;

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",


  // disable: process.env.NODE_ENV === "development",
  // register: true,
  // scope: "/app",
  // sw: "service-worker.js",
  //...
});

// Your Next config is automatically typed!
export default withPWA({
  experimental: {
    disableOptimizedLoading: true, // 페이지를 자동으로 prefetch 하지 않음
  },
  // Your Next.js config
});