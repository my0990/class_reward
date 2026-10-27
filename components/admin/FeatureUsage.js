"use client";
// 관리자 대시보드: 기능 사용량 (많이 쓴 순) + 30일 추이 막대 + 설정해 둔 반
import { useState } from "react";

const fmtDay = (key) => {
  const [, m, d] = key.split("-");
  return `${Number(m)}/${Number(d)}`;
};

/** 30일 작은 막대 그래프 (막대에 마우스를 올리면 그날 횟수) */
function Spark({ series, period }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const W = 120;
  const H = 28;
  const gap = 1;
  const bw = (W - gap * (series.length - 1)) / series.length;
  const recent = new Set(series.slice(-period).map((s) => s.day));
  const total = series.reduce((a, s) => a + s.count, 0);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`최근 30일 합계 ${total}회`} className="block">
      {series.map((s, i) => {
        const h = s.count ? Math.max(2, (s.count / max) * (H - 2)) : 1;
        return (
          <rect
            key={s.day}
            x={i * (bw + gap)}
            y={H - h}
            width={bw}
            height={h}
            rx={1}
            className={s.count ? (recent.has(s.day) ? "fill-orange-500" : "fill-orange-200") : "fill-slate-200"}
          >
            <title>{`${fmtDay(s.day)} · ${s.count}회`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default function FeatureUsage({ usage }) {
  const [period, setPeriod] = useState(7);
  const countKey = period === 7 ? "count7" : "count30";
  const classKey = period === 7 ? "classes7" : "classes30";
  const rows = [...usage.items].sort((a, b) => b[countKey] - a[countKey] || b.count30 - a.count30);
  const nothing = usage.items.every((i) => i.count30 === 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">기능 사용량</h2>
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 text-sm" role="tablist" aria-label="기간">
          {[7, 30].map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 ${period === p ? "bg-slate-900 font-semibold text-white" : "text-slate-600"}`}
            >
              {p}일
            </button>
          ))}
        </div>
      </div>

      {nothing ? (
        <p className="mb-3 text-sm text-slate-500">아직 쌓인 기록이 없습니다. 이 기능을 배포한 뒤부터 셉니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 font-medium">기능</th>
                <th className="py-2 text-right font-medium">사용 횟수</th>
                <th className="py-2 text-right font-medium">쓴 반</th>
                <th className="py-2 pl-4 font-medium">30일 추이</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.key} className={r[countKey] === 0 ? "text-slate-400" : ""}>
                  <td className="py-2">
                    {r.label}
                    {r.client && <span className="ml-1 text-xs text-slate-400">화면</span>}
                  </td>
                  <td className="py-2 text-right tabular-nums">{r[countKey].toLocaleString()}</td>
                  <td className="py-2 text-right tabular-nums">
                    {r[classKey]}
                    {usage.activeClasses ? <span className="text-slate-400"> / {usage.activeClasses}</span> : null}
                  </td>
                  <td className="py-2 pl-4">
                    <Spark series={r.series} period={period} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-700">지금까지 설정해 둔 반 (전체 {usage.activeClasses}개 중)</h3>
        <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {usage.adoption.map((a) => {
            const pct = usage.activeClasses ? Math.round((a.count / usage.activeClasses) * 100) : 0;
            return (
              <li key={a.label} className="flex justify-between gap-3">
                <span className="text-slate-600">{a.label}</span>
                <span className="tabular-nums">
                  {a.count}개 <span className="text-slate-400">({pct}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        ※ 같은 날 같은 기능은 횟수만 셉니다. 누가 썼는지는 남기지 않고, 쓴 반의 개수만 보여줍니다. &apos;화면&apos;은 브라우저에서만 도는 기능입니다(번호 뽑기·타이머 등).
        {usage.since ? ` 기록 시작: ${usage.since}` : ""}
      </p>
    </section>
  );
}
