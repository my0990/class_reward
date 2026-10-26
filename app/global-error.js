"use client";
// 가장 바깥(루트 레이아웃)에서 오류가 났을 때. 레이아웃 대신 그려지므로 html/body와 스타일을 직접 넣는다.
import { useEffect } from "react";
import { reportClientError } from "@/lib/errorLog/reportClientError";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    reportClientError(error, { source: "render" });
  }, [error]);

  return (
    <html lang="ko" style={{ colorScheme: "only light" }}>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#ffedd5", color: "#1f2937" }}>
        <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: "4rem", lineHeight: 1 }} aria-hidden="true">🍊💦</div>
          <h1 style={{ marginTop: 16, fontSize: "1.5rem" }}>잠시 문제가 생겼어요</h1>
          <p style={{ marginTop: 8, color: "#4b5563" }}>다시 시도해도 계속되면 카카오톡 문의하기로 알려주세요.</p>
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <button type="button" onClick={() => reset()} style={{ border: 0, borderRadius: 999, background: "#f97316", color: "#fff", padding: "12px 24px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
              다시 시도
            </button>
            <a href="/" style={{ borderRadius: 999, background: "#fff", color: "#ea580c", padding: "12px 24px", fontWeight: 700, textDecoration: "none" }}>
              처음 화면으로
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
