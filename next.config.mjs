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
  // Your Next.js config
});