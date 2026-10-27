// 관리자 대시보드: 최근 에러 (종류별로 묶음, 펼치면 코드 위치)
const SOURCE_LABEL = {
  server: { label: "서버", cls: "bg-rose-100 text-rose-800" },
  api: { label: "API", cls: "bg-rose-100 text-rose-800" },
  action: { label: "서버 액션", cls: "bg-amber-100 text-amber-800" },
  client: { label: "브라우저", cls: "bg-sky-100 text-sky-800" },
  render: { label: "화면 그리기", cls: "bg-violet-100 text-violet-800" },
  "client-action": { label: "버튼 실패", cls: "bg-slate-200 text-slate-700" },
};
const ROLE_LABEL = { teacher: "교사", student: "학생", kiosk: "키오스크", admin: "관리자", guest: "로그인 전" };

const fmtTime = (iso) =>
  iso
    ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
    : "";

export default function ErrorLogList({ errors }) {
  const { items, today, recentCount, days, currentBuild } = errors;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">최근 에러</h2>
        <span className="text-sm text-slate-500">
          오늘 {today.count.toLocaleString()}건 ({today.kinds}종류) · 최근 {days}일 {recentCount.toLocaleString()}건
          {currentBuild && <> · 지금 버전 <code>{currentBuild}</code></>}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">최근 {days}일 동안 기록된 에러가 없습니다. 🎉</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-sm">
          {items.map((e) => {
            const src = SOURCE_LABEL[e.source] ?? { label: e.source, cls: "bg-slate-100 text-slate-700" };
            return (
              <li key={e.fp} className="py-2">
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="w-24 shrink-0 tabular-nums text-slate-500">{fmtTime(e.lastAt)}</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${src.cls}`}>{src.label}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{e.message}</span>
                    <span className={`tabular-nums ${e.count >= 10 ? "font-bold text-rose-700" : "text-slate-600"}`}>×{e.count.toLocaleString()}</span>
                  </summary>
                  <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <div className="break-all text-slate-800">{e.message}</div>
                    {e.path && <div>화면/주소: <code>{e.path}</code></div>}
                    {e.roles.length > 0 && <div>누가: {e.roles.map((r) => ROLE_LABEL[r] ?? r).join(", ")}</div>}
                    {e.devices.length > 0 && <div>기기: {e.devices.join(", ")}</div>}
                    {e.builds.length > 0 && (
                      <div>
                        버전:{" "}
                        {e.builds.map((b) => (
                          <code key={b} className={`mr-1 rounded px-1 ${currentBuild && b !== currentBuild ? "bg-amber-100 text-amber-800" : "bg-white"}`}>
                            {b}
                          </code>
                        ))}
                        {currentBuild && e.builds.some((b) => b !== currentBuild) && <span className="text-amber-700">(예전 버전 포함: 배포 직후 열려 있던 화면일 수 있어요)</span>}
                      </div>
                    )}
                    {e.digest && (
                      <div>
                        digest: <code className="select-all">{e.digest}</code> <span className="text-slate-400">(Vercel 로그에서 이 값으로 찾으면 서버 쪽 원인이 보여요)</span>
                      </div>
                    )}
                    <div>처음 {fmtTime(e.firstAt)} · 마지막 {fmtTime(e.lastAt)}</div>
                    {e.stack && <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-2 text-[11px] leading-snug">{e.stack}</pre>}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-slate-500">
        ※ 같은 에러는 하루 한 줄로 묶어 횟수만 셉니다. 30일 지나면 자동으로 지워집니다. 개인 정보(이메일·아이디 값 등)는 가려서 저장합니다.
      </p>
    </section>
  );
}
