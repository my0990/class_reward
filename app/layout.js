import { Inter } from "next/font/google";
import "./globals.css";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";
import RecoilRootProvider from "@/util/recoilRootProvider";
import Layout from "@/util/Layout";
import Script from "next/script";

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
  initialScale: 1,
};
export default async function RootLayout({ children }) {
  // const session = await getServerSession(authOptions);
  // let response = null;
  // let response2 = null;
  // let teacher = null;
  // console.log(session)
  // if (session) {


  //   if (session.user.role === "teacher") {
  //     teacher = session.user.userId
  //   } else {
  //     teacher = session.user.teacher
  //   }
  // }
  // if (session) {
  //   const db = (await connectDB).db('data');
  //   response = await db.collection('user_data').findOne({ userId: session.user.userId })
  //   response2 = await db.collection('thermometer').findOne({ userId: teacher })
  // }
  // console.log(response2)  
  const GA_MEASUREMENT_ID = "G-1XP2WLNQ01"

  return (
    <html lang="en" className="w-full dark:bg-gray-700">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
         {/* <meta name="google" content="notranslate" /> */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* <RecoilRootProvider> */}
        {/* <Layout fetchedUserData={response} fetchedThermometerData={response2} session={session} /> */}
        {children}
        {/* </RecoilRootProvider> */}
      </body>
    </html>

  );
}
