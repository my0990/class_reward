import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/common/Analytics";
import ClientErrorReporter from "@/components/common/ClientErrorReporter";
import { Toaster } from "react-hot-toast";

// import Head from "next/head";
const inter = Inter({ subsets: ["latin"] });


const APP_NAME = "뀰";
const APP_DEFAULT_TITLE = "뀰 - 학급 보상 관리";
// 각 화면의 title이 "%s" 자리에 들어간다 (예: "관리자 | 뀰")
const APP_TITLE_TEMPLATE = "%s | 뀰";
const APP_DESCRIPTION = "학급 보상을 관리합니다";


export const metadata = {
  icons: {
    icon: "/favicon.png",
  },
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },

  description: APP_DESCRIPTION,

  // manifest(홈 화면에 추가)는 키오스크 화면에서만: app/teacher/kiosk/[id]/layout.js
  formatDetection: {
    telephone: false,
  },
  // 크롬 '이 페이지를 번역할까요?' 끄기 (<meta name="google" content="notranslate">)
  other: { google: "notranslate" },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
  // 항상 밝은 화면 (브라우저의 다크 모드 자동 변환도 최대한 막음)
  colorScheme: "only light",
  initialScale: 1,
};
export default async function RootLayout({ children }) {

  return (
    // lang="ko" + translate="no": 영어 페이지로 알고 브라우저가 자동 번역하면 화면 글자가 바뀌어
    // React가 관리하던 부분이 사라지고 'removeChild' 오류로 멈춘다 (특히 아이패드 사파리)
    <html lang="ko" translate="no" className="notranslate w-full" data-theme="light" style={{ colorScheme: "only light" }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* 방문 통계: 선생님 화면에서만 (components/common/Analytics.js) */}
        <Analytics />
        {/* 브라우저 에러를 관리자 '최근 에러'로 신고 (배포된 사이트에서만) */}
        <ClientErrorReporter />
        {/* 알림(토스트)은 여기 하나로: 페이지를 옮겨도 메시지가 남는다 */}
        <Toaster position="top-center" toastOptions={{ style: { fontSize: "1.05rem" } }} />
        {children}
      </body>
    </html>

  );
}
