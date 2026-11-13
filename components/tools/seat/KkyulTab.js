"use client";
// 설정 창 [뀰] 탭: 뀰 소개(홍보). 맨 아래 🍊를 누르면 코드 입력칸이 나오고,
// 코드가 맞으면 탭 전체가 '자리 고정' 화면으로 바뀐다 (학생들이 TV 화면을 봐도 모르게)
// 창을 닫거나 다른 탭으로 가면 다시 소개 화면으로 돌아간다.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });
import FixedSeats from "./FixedSeats";

// 자리 고정을 여는 코드 (화면에는 안 보임, 입력할 때도 ●로 가려짐). 바꾸려면 여기만 고치면 된다
export const SEAT_SECRET_CODE = "0915";

const FEATURES = [
  ["🍪", "학급 화폐", "칭찬할 때 바로 지급·회수, 학생마다 잔액과 거래 기록"],
  ["📜", "퀘스트", "일일·주간·일반 퀘스트, 완료하면 화폐·경험치·칭호 보상"],
  ["🏪", "학급 상점", "모은 화폐로 학급에서 정한 물건·쿠폰 구입"],
  ["🖥️", "키오스크", "교실 태블릿에서 학생이 직접 퀘스트 완료 신청"],
  ["✅", "승인 센터", "학생 신청을 선생님이 한 번에 확인하고 승인"],
  ["⏱️", "수업 도구", "타이머·판서·소음 측정, 번호 뽑기, 자리 바꾸기 기록 저장"],
];

export default function KkyulTab({ guest, rules, setRules, students, layout }) {
  const [asking, setAsking] = useState(false); // 코드 입력칸 보이기
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // 코드가 맞으면 탭 전체가 자리 고정 화면 (돌아가기는 평범한 글자로)
  if (unlocked) {
    return (
      <div className="flex flex-col gap-3">
        <FixedSeats rules={rules} setRules={setRules} students={students} layout={layout} />
        <button type="button" className="self-center text-sm text-gray-400 hover:text-gray-600" onClick={() => setUnlocked(false)}>
          돌아가기
        </button>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    if (code.trim() === SEAT_SECRET_CODE) {
      setUnlocked(true);
      setAsking(false);
    }
    setCode(""); // 틀려도 아무 안내 없이 비우기만
  };

  // 선생님(회원): 홍보 대신 로그인 화면의 귤 애니메이션을 크게. 누르면 코드 입력
  if (!guest) {
    return (
      <div className="flex h-full items-center justify-center">
        <BigKkyul
          onClick={() => {
            setAsking(true);
            setCode("");
          }}
        />
        {asking && <CodeModal code={code} setCode={setCode} onSubmit={submit} onClose={() => setAsking(false)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-5">
        <h3 className="text-xl font-extrabold text-orange-600">🍊 뀰 — 우리 반 학급 화폐</h3>
        <p className="mt-2 leading-7 text-gray-700">
          무료 학급 운영 서비스예요. 칭찬과 보상을 화폐로 쌓고, 퀘스트로 습관을 만들고, 수업 도구까지 한곳에서 써요.
        </p>
        {guest ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/auth/signup" className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600">
              무료로 가입하기
            </a>
            <a href="/auth/login/teacher" className="btn btn-sm border-0 bg-white text-gray-700 hover:bg-orange-50">
              로그인
            </a>
          </div>
        ) : null}
      </section>

      <ul className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(([icon, title, desc]) => (
          <li key={title} className="flex gap-3 rounded-2xl border border-orange-100 bg-white p-4">
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="font-bold">{title}</div>
              <div className="text-sm text-gray-500">{desc}</div>
            </div>
          </li>
        ))}
      </ul>

      {/* 숨은 버튼: 장식처럼 보이는 큰 🍊 (누르기 쉽게). 누르면 코드 입력칸 */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            setAsking((v) => !v);
            setCode("");
          }}
          className="flex h-16 w-16 cursor-default select-none items-center justify-center bg-transparent text-5xl"
        >
          🍊
        </button>
        {asking && <CodeModal code={code} setCode={setCode} onSubmit={submit} onClose={() => setAsking(false)} />}
      </div>
    </div>
  );
}

/**
 * 코드 입력 창 (설정 창 위에 하나 더). 설정 창 안은 움직임(transform) 때문에 fixed가 창 안에 갇혀서
 * 화면(전체 화면이면 그 요소)에 바로 붙인다. 여기서 누르거나 Esc를 눌러도 아래 설정 창은 닫히지 않게 막는다.
 */
function CodeModal({ code, setCode, onSubmit, onClose }) {
  if (typeof document === "undefined") return null;
  const stop = (e) => e.stopPropagation();
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onPointerDown={stop}
      onPointerUp={stop}
      onMouseDown={stop}
      onMouseUp={stop}
      onClick={(e) => {
        stop(e);
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        stop(e);
        onClose();
      }}
    >
      <form onSubmit={onSubmit} className="w-[min(280px,100%)] rounded-2xl bg-white p-5 text-center shadow-xl">
        <div className="mb-3 text-3xl" aria-hidden="true">🍊</div>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input input-bordered w-full text-center text-lg tracking-[0.4em]"
          aria-label="코드"
        />
        <div className="mt-3 flex justify-center gap-2">
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
            닫기
          </button>
          <button type="submit" className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600">
            확인
          </button>
        </div>
      </form>
    </div>,
    document.fullscreenElement ?? document.body
  );
}

/** 로그인 화면과 같은 귤 애니메이션 (둥근 틀, 설정 창 높이에 맞춤). 장식처럼 보이게 손가락 커서 없음 */
function BigKkyul({ onClick }) {
  const [json, setJson] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch("/kkyul-hello.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && setJson(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  // 로티(500×500) 중 귤이 보이는 곳은 가운데 지름 300 → 틀 크기의 5/3로 그려 가운데만 (로그인 화면과 같은 비율)
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className="relative aspect-square w-[min(100%,58vh,520px)] cursor-default select-none overflow-hidden rounded-full [container-type:size]"
    >
      {json && (
        <div className="absolute left-1/2 top-1/2 h-[166.67cqh] w-[166.67cqw] -translate-x-1/2 -translate-y-1/2">
          <Lottie loop play animationData={json} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
    </button>
  );
}
