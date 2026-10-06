import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/common/Analytics";

// import Head from "next/head";
const inter = Inter({ subsets: ["latin"] });


const APP_NAME = "뀰";
const APP_DEFAULT_TITLE = "뀰 - 학급 보상 관리";
// const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_TITLE_TEMPLATE = "맛있는 귤은 뀰";
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
        {/* <RecoilRootProvider> */}
        {/* <Layout fetchedUserData={response} fetchedThermometerData={response2} session={session} /> */}
        {children}
        {/* </RecoilRootProvider> */}
      </body>
    </html>

  );
}
