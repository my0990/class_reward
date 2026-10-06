import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/common/Analytics";
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
  initialScale: 1,
};
export default async function RootLayout({ children }) {

  return (
    <html lang="en" className="w-full dark:bg-gray-700">
      <head>
         {/* <meta name="google" content="notranslate" /> */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* 방문 통계: 선생님 화면에서만 (components/common/Analytics.js) */}
        <Analytics />
        {/* 알림(토스트)은 여기 하나로: 페이지를 옮겨도 메시지가 남는다 */}
        <Toaster position="top-center" toastOptions={{ style: { fontSize: "1.05rem" } }} />
        {/* <RecoilRootProvider> */}
        {/* <Layout fetchedUserData={response} fetchedThermometerData={response2} session={session} /> */}
        {children}
        {/* </RecoilRootProvider> */}
      </body>
    </html>

  );
}
