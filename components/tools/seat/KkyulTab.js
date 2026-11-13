"use client";
// 설정 창 [뀰] 탭: 뀰 소개(홍보). 맨 아래 작은 🍊를 두 번 누르면 '자리 고정'이 열린다 (학생들이 TV 화면을 봐도 모르게)
// 창을 닫거나 다른 탭으로 가면 다시 숨겨진다.
import { useState } from "react";
import FixedSeats from "./FixedSeats";

const FEATURES = [
  ["🍪", "학급 화폐", "칭찬할 때 바로 지급·회수, 학생마다 잔액과 거래 기록"],
  ["📜", "퀘스트", "일일·주간·일반 퀘스트, 완료하면 화폐·경험치·칭호 보상"],
  ["🏪", "학급 상점", "모은 화폐로 학급에서 정한 물건·쿠폰 구입"],
  ["🖥️", "키오스크", "교실 태블릿에서 학생이 직접 퀘스트 완료 신청"],
  ["✅", "승인 센터", "학생 신청을 선생님이 한 번에 확인하고 승인"],
  ["⏱️", "수업 도구", "타이머·판서·소음 측정, 번호 뽑기, 자리 바꾸기 기록 저장"],
];

export default function KkyulTab({ guest, rules, setRules, students, layout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-5">
        <h3 className="text-xl font-extrabold text-orange-600">🍊 뀰 — 우리 반 학급 화폐</h3>
        <p className="mt-2 leading-7 text-gray-700">
          선생님이 직접 만든 무료 학급 운영 서비스예요. 칭찬과 보상을 화폐로 쌓고, 퀘스트로 습관을 만들고, 수업 도구까지 한곳에서 써요.
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

      {guest && (
        <p className="text-center text-sm text-gray-500">
          가입하면 학생 명단이 저장되고, 여러 컴퓨터에서 같은 자리 기록을 볼 수 있어요.
        </p>
      )}

      {/* 숨은 버튼: 평범한 장식처럼 보이게 (손가락 모양 커서·테두리 없음). 두 번 눌러야 열림 */}
      <p className="mt-2 text-center text-xs text-gray-300">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onDoubleClick={() => setOpen((v) => !v)}
          className="cursor-default select-none bg-transparent p-0 align-baseline"
        >
          🍊
        </button>{" "}
        kkyul.kr
      </p>

      {open && <FixedSeats rules={rules} setRules={setRules} students={students} layout={layout} />}
    </div>
  );
}
