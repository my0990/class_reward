"use client";
// 관리자 '계정 도우미': 선생님 이메일로 계정 상태 보기 + 잠금 풀기 / 메일 제한 풀기 / 임시 비밀번호
// 이메일은 주소창에 남지 않게 server action(POST)으로만 보낸다.
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  lookupTeacherAccountAction,
  unlockTeacherLoginAction,
  clearTeacherEmailLimitAction,
  issueTeacherTempPasswordAction,
  findTeacherByClassNicknameAction,
} from "@/server-action/admin/teacherAccount.action";

const fmt = (iso) =>
  iso
    ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
    : "—";

function Row({ label, children, warn = false }) {
  return (
    <div className="flex flex-wrap gap-x-3 py-2">
      <dt className="w-36 shrink-0 text-slate-500">{label}</dt>
      <dd className={`min-w-0 flex-1 ${warn ? "font-semibold text-rose-700" : ""}`}>{children}</dd>
    </div>
  );
}

/** 상태를 보고 한 줄 진단 */
function diagnose(r) {
  if (!r.found) {
    return r.mail.sent24h > 0
      ? "가입된 계정이 없어요. 최근 이 이메일로 인증 메일을 받은 기록은 있어요 → 가입을 끝내지 못했을 수 있어요."
      : "가입된 계정이 없어요. 다른 이메일로 가입했거나 오타일 가능성이 높아요.";
  }
  const a = r.account;
  if (a.disabled) return "탈퇴 처리 중인 계정이에요. 로그인과 비밀번호 찾기가 모두 안 돼요.";
  if (r.login.lockedUntil) return "비밀번호를 여러 번 틀려서 로그인이 잠겨 있어요. 잠금을 풀어 주세요.";
  if (r.mail.limited) return "오늘 인증 메일을 한도까지 받았어요. 메일 제한을 풀어 주면 다시 받을 수 있어요.";
  if (a.mustChangePassword) return "임시 비밀번호가 발급된 상태예요. 로그인하면 새 비밀번호를 정하게 돼요.";
  if (r.resetCode?.alive) return "비밀번호 찾기 코드가 살아 있어요. 메일함(스팸함 포함)에서 가장 최근 메일의 코드를 쓰게 안내해 주세요.";
  return "계정에 문제는 보이지 않아요. 메일이 안 온다면 스팸함을 확인하게 하거나 임시 비밀번호를 발급해 주세요.";
}

export default function TeacherAccountHelper() {
  const [mode, setMode] = useState("email"); // email | class (반 고유 아이디·학생 아이디로 찾기)
  const [email, setEmail] = useState("");
  const [keyword, setKeyword] = useState("");
  const [via, setVia] = useState(null); // 반 고유 아이디로 찾았을 때: { className, uniqueNickname, matchedBy, classDeleted }
  const [res, setRes] = useState(null); // 조회 결과
  const [confirmed, setConfirmed] = useState(false);
  const [temp, setTemp] = useState(null); // 방금 만든 임시 비밀번호 (화면을 떠나면 사라짐)
  const [pending, start] = useTransition();

  const lookup = (target = email, from = null) =>
    start(async () => {
      setVia(from);
      setTemp(null);
      setConfirmed(false);
      const r = await lookupTeacherAccountAction({ email: target });
      if (!r.result) {
        setRes(null);
        toast.error(r.message || "조회하지 못했습니다.");
        return;
      }
      setRes(r.data);
    });

  // 반 고유 아이디(또는 학생 아이디) → 선생님 이메일 → 계정 상태 보기
  const findByClass = () =>
    start(async () => {
      const r = await findTeacherByClassNicknameAction({ keyword });
      if (!r.result) {
        setRes(null);
        setVia(null);
        toast.error(r.message || "찾지 못했습니다.");
        return;
      }
      const { email: found, ...from } = r.data;
      setEmail(found);
      lookup(found, from);
    });

  const act = (fn, after) =>
    start(async () => {
      const r = await fn({ email: res.email, confirmed });
      if (!r.result) {
        toast.error(r.message || "처리하지 못했습니다.");
        return;
      }
      toast.success(r.message);
      after?.(r.data);
      const again = await lookupTeacherAccountAction({ email: res.email });
      if (again.result) setRes(again.data);
    });

  const issueTemp = () => {
    if (!confirmed) return toast.error("본인 확인을 먼저 해주세요.");
    if (!window.confirm(`${res.email} 계정의 비밀번호를 임시 비밀번호로 바꿀까요?\n이 선생님은 모든 기기에서 로그아웃됩니다.`)) return;
    act(issueTeacherTempPasswordAction, (d) => {
      setTemp(d.tempPassword);
      setConfirmed(false);
    });
  };

  const copyTemp = async () => {
    try {
      await navigator.clipboard.writeText(temp);
      toast.success("복사했어요.");
    } catch {
      toast.error("복사하지 못했어요. 직접 적어 주세요.");
    }
  };

  const a = res?.account;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">계정 도우미</h1>
        <p className="mt-1 text-sm text-slate-500">선생님 이메일로 계정 상태를 보고, 로그인·비밀번호 문제를 해결합니다. 이메일은 정확히 입력해야 찾아요.</p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="tablist">
        {[
          ["email", "이메일로"],
          ["class", "반 고유 아이디로"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-md px-3 py-1.5 ${mode === id ? "bg-slate-900 font-semibold text-white" : "text-slate-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mode === "email" ? lookup() : findByClass();
        }}
        className="flex flex-wrap gap-2"
      >
        {mode === "email" ? (
          <input
            type="email"
            inputMode="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="선생님 이메일"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2"
            required
          />
        ) : (
          <input
            type="text"
            autoComplete="off"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="반 고유 아이디 또는 학생 아이디 (예: 해바라기, 해바라기3)"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2"
            required
          />
        )}
        <button type="submit" disabled={pending || !(mode === "email" ? email : keyword).trim()} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50">
          {pending && !res ? "찾는 중..." : "조회"}
        </button>
      </form>

      {res && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="break-all font-semibold">{res.email}</h2>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${res.found ? (a.disabled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800") : "bg-slate-200 text-slate-700"}`}>
              {res.found ? (a.disabled ? "탈퇴 처리 중" : "가입됨") : "계정 없음"}
            </span>
          </div>

          {via && (
            <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
              🔎 반 고유 아이디 <b>{via.uniqueNickname}</b>
              {via.className ? ` (${via.className})` : ""}
              {via.matchedBy === "student" ? "에 속한 학생 아이디로" : "로"} 찾은 선생님 계정이에요.
              {via.classDeleted ? " 이 반은 휴지통에 있어요." : ""}
              <br />
              <span className="text-sky-900/70">이메일을 알려 주기 전에 본인인지 꼭 확인하세요. 필요하면 앞부분만 알려 주세요.</span>
            </p>
          )}

          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">💡 {diagnose(res)}</p>

          <dl className="divide-y divide-slate-100 text-sm">
            {res.found && (
              <>
                <Row label="가입일">{fmt(a.createdAt)}</Row>
                <Row label="최근 접속">{fmt(a.lastSeenAt)}</Row>
                <Row label="학급 / 학생">
                  학급 {a.classes}개{a.trashedClasses ? ` (휴지통 ${a.trashedClasses})` : ""} · 학생 {a.students}명
                </Row>
                <Row label="비밀번호 바꾼 때">{fmt(a.passwordChangedAt)}{a.mustChangePassword ? " · 임시 비밀번호 상태" : ""}</Row>
                <Row label="로그인 잠김" warn={Boolean(res.login.lockedUntil)}>
                  {res.login.lockedUntil ? `${fmt(res.login.lockedUntil)}까지 잠김` : `아니요 (틀린 횟수 ${res.login.failCount}/${res.login.maxFails})`}
                </Row>
                <Row label="비밀번호 찾기 코드">
                  {res.resetCode
                    ? res.resetCode.alive
                      ? `유효 · ${fmt(res.resetCode.sentAt)} 보냄 · ${fmt(res.resetCode.expiresAt)}까지 · 남은 시도 ${res.resetCode.attemptsLeft}번`
                      : "만료됨 또는 시도 횟수 다 씀"
                    : "없음"}
                </Row>
                {a.disabled && <Row label="탈퇴 신청" warn>{fmt(a.disabledAt)}</Row>}
              </>
            )}
            <Row label="인증 메일 (24시간)" warn={res.mail.limited}>
              {res.mail.sent24h}/{res.mail.dailyLimit}통{res.mail.limited ? " · 한도 도달" : ""} · 마지막 {fmt(res.mail.lastSentAt)}
            </Row>
          </dl>

          {res.found && !a.disabled && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={() => act(unlockTeacherLoginAction)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                  로그인 잠금 풀기
                </button>
                <button type="button" disabled={pending} onClick={() => act(clearTeacherEmailLimitAction)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                  오늘 메일 제한 풀기
                </button>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <h3 className="font-semibold text-rose-900">임시 비밀번호 발급</h3>
                <p className="mt-1 text-sm text-rose-900/80">
                  다른 사람이 선생님인 척 요청할 수 있어요. <b>그 이메일 주소로 직접 메일을 받는 등 본인 확인을 꼭 한 뒤에</b> 발급하세요.
                  발급하면 모든 기기에서 로그아웃되고, 다음 로그인 때 새 비밀번호를 정해야 해요.
                </p>
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                  <span>이 이메일의 주인이 맞는지 확인했어요.</span>
                </label>
                <button type="button" disabled={pending || !confirmed} onClick={issueTemp} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40">
                  임시 비밀번호 만들기
                </button>

                {temp && (
                  <div className="mt-3 rounded-lg bg-white p-3">
                    <div className="text-xs text-slate-500">임시 비밀번호 (이 화면을 벗어나면 다시 볼 수 없어요)</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <code className="select-all rounded bg-slate-100 px-2 py-1 font-mono text-lg tracking-wider">{temp}</code>
                      <button type="button" onClick={copyTemp} className="rounded border border-slate-300 px-2 py-1 text-sm">
                        복사
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">본인에게만 전해 주세요. 로그인하면 바로 새 비밀번호를 정하게 됩니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
