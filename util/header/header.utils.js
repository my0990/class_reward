// components/header/header.utils.js

export const getToolsBaseUrl = (hostname) => {
    if (!hostname) return "https://kkyul.kr/";
    return hostname.includes("vercel.app")
      ? "https://class-reward.vercel.app/"
      : "https://kkyul.kr/";
  };