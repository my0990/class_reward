/** @type {import('tailwindcss').Config} */
module.exports = {
  // 다크 모드는 쓰지 않는다: 기기가 다크 모드여도 dark: 색이 저절로 켜지지 않게 'class' 방식 (.dark를 붙이는 곳 없음)
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // util에 색 클래스를 모아 둔 파일이 있다 (예: util/quest/questRepeat.js의 퀘스트 종류별 색)
    "./util/**/*.{js,jsx}",
    "./config/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      height: {
        'real-screen': 'calc(var(--vh) * 100)',
      },
      // extend 안에 둬야 기본 min-h-* (min-h-screen, min-h-dvh 등)이 사라지지 않는다
      minHeight: {
        'real-screen': 'calc(var(--vh) * 100)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],
  // daisyUI도 밝은 테마 하나만: 기기가 다크 모드여도 버튼·입력칸이 까맣게 바뀌지 않음
  daisyui: {
    themes: ["light"],
    darkTheme: "light",
  },
  mode: "jit",
};
