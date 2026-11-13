"use client";
// 설정 창 [뀰] 탭: 뀰 소개(홍보). 맨 아래 🍊를 누르면 코드 입력칸이 나오고,
// 코드가 맞으면 탭 전체가 '자리 고정' 화면으로 바뀐다 (학생들이 TV 화면을 봐도 모르게)
// 창을 닫거나 다른 탭으로 가면 다시 소개 화면으로 돌아간다.
import { useState } from "react";
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
        {asking && (
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setAsking(false))}
              className="input input-bordered input-sm w-28 text-center tracking-widest"
              aria-label="코드"
            />
          </form>
        )}
      </div>
    </div>
  );
}
