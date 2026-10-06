"use client";
// Google Analytics: 선생님만 쓰는 화면에서만 켠다 (초등학생 개인정보 보호).
// 켜는 곳: 선생님 화면(/teacher, 키오스크 제외), 선생님 로그인·회원가입·비밀번호 찾기
// 끄는 곳: 첫 화면(학생도 거쳐 감), 학생 화면·학생 로그인, 키오스크, 관리자, 개인정보처리방침 등 나머지 전부
// - 처음 들어온 화면이 꺼야 하는 곳이면 스크립트 자체를 불러오지 않는다.
// - 선생님 화면에서 키오스크로 이동하면 GA 공식 끄기 플래그(ga-disable-<ID>)로 수집을 멈춘다.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { isAnalyticsAllowed } from "./analyticsPaths";

export const GA_MEASUREMENT_ID = "G-1XP2WLNQ01";
export default function Analytics() {
  const pathname = usePathname();
  const allowed = isAnalyticsAllowed(pathname);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !allowed;
    if (allowed) setLoad(true);
  }, [allowed]);

  if (!load) return null;
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
