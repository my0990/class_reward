"use client";
// 관리자 대시보드: 일별·주별·월별 이용자 꺾은선 그래프
// - 위의 일/주/월 버튼 하나로 세 그래프(교사·학생·키오스크)가 함께 바뀐다
// - 그래프마다 한 가지 값만 그린다 → 범례 없이 제목이 이름 (단위가 달라 한 그래프에 섞지 않음)
// - 기록을 시작하기 전 기간(null)은 선을 끊어서 비워 둔다 (0으로 보이지 않게)
// - 마우스/터치: 세로선 + 툴팁, "표로 보기"로 숫자 확인
import { useState } from "react";

const PERIODS = [
  { id: "day", label: "일별", current: "오늘" },
  { id: "week", label: "주별", current: "이번 주" },
  { id: "month", label: "월별", current: "이번 달" },
];

const CHARTS = [
  { field: "teachers", title: "접속한 교사", unit: "명" },
  { field: "students", title: "접속한 학생", unit: "명" },
  { field: "kioskUses", title: "키오스크 사용", unit: "번" },
];

const LINE = "#ea580c"; // orange-600 (흰 배경 대비 3:1 이상)
// 세 칸으로 나눠 보여서 viewBox를 작게 잡아야 글자가 읽힐 크기로 나온다
const W = 400;
const H = 180;
const PAD = { top: 14, right: 12, bottom: 24, left: 34 };

function niceMax(v) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v);
  return step * 4;
}

const num = (s) => Number(s);
const shortLabel = (period, key) => {
  if (period === "month") return `${num(key.slice(5, 7))}월`;
  return `${num(key.slice(5, 7))}/${num(key.slice(8, 10))}`;
};
const longLabel = (period, key) => {
  if (period === "month") return `${key.slice(0, 4)}년 ${num(key.slice(5, 7))}월`;
  if (period === "week") return `${num(key.slice(5, 7))}/${num(key.slice(8, 10))} 주`;
  return `${num(key.slice(5, 7))}/${num(key.slice(8, 10))}`;
};

function LineChart({ title, unit, period, points }) {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const current = PERIODS.find((p) => p.id === period).current;

  const values = points.map((p) => p.value).filter((v) => v != null);
  const last = points.at(-1);
  const max = niceMax(Math.max(0, ...values));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;
  const x = (i) => PAD.left + i * step;
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const showDots = points.length <= 16;

  // null에서 끊기는 선분들
  const segments = [];
  let cur = [];
  points.forEach((p, i) => {
    if (p.value == null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else cur.push(`${x(i).toFixed(1)},${y(p.value).toFixed(1)}`);
  });
  if (cur.length) segments.push(cur);

  const labelIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  const h = hover != null ? points[hover] : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>
            {current} {last?.value == null ? "-" : `${last.value.toLocaleString()}${unit}`}
          </span>
          <button type="button" className="underline" onClick={() => setShowTable((v) => !v)}>
            {showTable ? "그래프로 보기" : "표로 보기"}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="max-h-[230px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-slate-500">
              <tr>
                <th className="py-1">기간</th>
                <th className="py-1 text-right">{unit}</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.key} className="border-t border-slate-100">
                  <td className="py-1">{longLabel(period, p.key)}</td>
                  <td className="py-1 text-right tabular-nums">{p.value == null ? "기록 전" : p.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${title} ${PERIODS.find((p) => p.id === period).label} 꺾은선 그래프`}
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
                <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#64748b">
                  {t.toLocaleString()}
                </text>
              </g>
            ))}

            {h && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="#94a3b8" strokeWidth="1" />}

            {segments.map((seg, i) =>
              seg.length === 1 ? null : (
                <polyline key={i} points={seg.join(" ")} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              )
            )}

            {points.map((p, i) =>
              p.value == null ? null : (
                <circle
                  key={p.key}
                  cx={x(i)}
                  cy={y(p.value)}
                  r={hover === i ? 5 : showDots || segments.some((s) => s.length === 1) ? 4 : 0}
                  fill={LINE}
                  stroke="#fff"
                  strokeWidth="2"
                />
              )
            )}

            {/* 점보다 넓은 투명 영역으로 hover 잡기 */}
            {points.map((p, i) => (
              <rect
                key={p.key}
                x={x(i) - (step || innerW) / 2}
                y={PAD.top}
                width={step || innerW}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              />
            ))}

            {labelIdx.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={H - 6}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                fontSize="11"
                fill="#64748b"
              >
                {shortLabel(period, points[i].key)}
              </text>
            ))}
          </svg>

          {values.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              아직 기록이 없습니다
            </div>
          )}

          {h && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow"
              style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
            >
              {longLabel(period, h.key)}
              {hover === points.length - 1 && period !== "day" ? " (진행 중)" : ""} ·{" "}
              {h.value == null ? "기록 전" : `${h.value.toLocaleString()}${unit}`}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function UsageTrends({ usage }) {
  const [period, setPeriod] = useState("day");
  const rows = usage[period];

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">이용자 추이</h2>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-md px-3 py-1 ${period === p.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        일별 최근 30일 · 주별 최근 12주(월요일 시작) · 월별 최근 12달. 주별·월별 교사·학생은 그 기간에 한 번 이상 접속한 사람 수(중복 없음)이고,
        키오스크는 사용 횟수의 합입니다. 개인 정보 없이 숫자만 저장하며, 기록을 시작하기 전 기간은 비워 둡니다.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {CHARTS.map((c) => (
          <LineChart
            key={c.field}
            title={c.title}
            unit={c.unit}
            period={period}
            points={rows.map((r) => ({ key: r.key, value: r[c.field] }))}
          />
        ))}
      </div>
    </section>
  );
}
