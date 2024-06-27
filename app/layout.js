import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata, Viewport } from "next";
// import Head from "next/head";
const inter = Inter({ subsets: ["latin"] });


const APP_NAME = "뀰";
const APP_DEFAULT_TITLE = "뀰 - 학급 보상 관리";
// const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_TITLE_TEMPLATE = "맛있는 귤은 뀰";
const APP_DESCRIPTION = "학급 보상을 관리합니다";


export const metadata = {
  icons: {
		icon: "/favicon.ico",
	},
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },

  description: APP_DESCRIPTION,

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
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
};
export default function RootLayout({ children }) {

  return (
    <html lang="en" className="w-full dark:bg-gray-700" >

      <body className={inter.className}>
        <div>{children}</div>
      </body>
    </html>
  );
}
