"use client";
// 관리자 대시보드: 비회원 도구 방문자 (타이머 · 자리 바꾸기 따로)
// - 일일 방문자: 같은 브라우저는 하루 1번 / 주간 방문자: 같은 브라우저는 주(월~일) 1번
// - 최근 14일 막대 (막대에 마우스를 올리면 그날 숫자)

const fmtDay = (key) => {
  const [, m, d] = key.split("-");
  return `${Number(m)}/${Number(d)}`;
};
const weekday = (key) => "일월화수목금토"[new Date(`${key}T00:00:00Z`).getUTCDay()];

/** 지난번과 비교: ▲3 / ▼2 / – */
function Diff({ now, before }) {
  const d = now - before;
  if (!before && !now) return <span className="text-slate-400">–</span>;
  if (d === 0) return <span className="text-slate-400">어제와 같음</span>;
  return <span className={d > 0 ? "text-emerald-600" : "text-rose-500"}>{d > 0 ? `▲${d}` : `▼${-d}`}</span>;
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold tabular-nums text-slate-900">{value.toLocaleString()}<span className="ml-0.5 text-sm font-normal text-slate-500">명</span></div>
      <div className="text-xs">{sub}</div>
    </div>
  );
}

function Bars({ daily }) {
  const max = Math.max(1, ...daily.map((d) => d.count));
  return (
    <div className="mt-3">
      <div className="flex h-28 items-end gap-1" role="img" aria-label="최근 14일 일일 방문자">
        {daily.map((d, i) => {
          const isToday = i === daily.length - 1;
          const weekend = ["토", "일"].includes(weekday(d.day));
          return (
            <div key={d.day} className="group flex flex-1 flex-col items-center justify-end" title={`${fmtDay(d.day)}(${weekday(d.day)}) · ${d.count}명`}>
              <span className={`mb-0.5 text-[10px] tabular-nums ${d.count ? "text-slate-600" : "text-transparent"}`}>{d.count}</span>
              <div
                className={`w-full rounded-t ${d.count ? (isToday ? "bg-orange-500" : "bg-orange-300 group-hover:bg-orange-400") : "bg-slate-200"}`}
                style={{ height: d.count ? `${Math.max(4, (d.count / max) * 88)}px` : "2px" }}
              />
              <span className={`mt-1 text-[10px] ${weekend ? "text-rose-400" : "text-slate-400"}`}>{i % 2 === daily.length % 2 || isToday ? fmtDay(d.day) : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolCard({ icon, title, path, data }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="font-semibold">
          {icon} {title}
        </h4>
        <a href={path} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:underline">
          {path}
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="오늘 방문자" value={data.today} sub={<>어제 {data.yesterday}명 · <Diff now={data.today} before={data.yesterday} /></>} />
        <Stat
          label="이번 주 방문자"
          value={data.thisWeek}
          sub={
            <span className="text-slate-500">
              지난주 {data.lastWeek}명
            </span>
          }
        />
      </div>
      <Bars daily={data.daily} />
      <p className="mt-2 text-xs text-slate-500">
        {data.actions.map((a) => `${a.label} 오늘 ${a.today} · 이번 주 ${a.week}`).join("  |  ")}
      </p>
    </div>
  );
}

export default function GuestStats({ guest }) {
  if (!guest) return null;
  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">비회원 도구 방문자</h3>
        <span className="text-xs text-slate-500">
          가입하기 클릭 오늘 {guest.signups.today} · 이번 주 {guest.signups.week}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolCard icon="⏱️" title="타이머" path="/tools/timer" data={guest.timer} />
        <ToolCard icon="🪑" title="자리 바꾸기" path="/tools/seat" data={guest.seat} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        ※ 같은 브라우저는 하루 1번(일일), 한 주(월~일) 1번(주간)만 셉니다. 이름·IP는 남기지 않습니다. 주간 방문자는 이 기능을 배포한 주부터 정확해요.
      </p>
    </div>
  );
}
