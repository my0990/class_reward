"use client";
// 최근 30일 일별 막대 그래프 (한 가지 값만 그린다 → 범례 없음, 제목이 이름)
// - 막대 위에 마우스/터치: 날짜와 값 툴팁
// - "표로 보기"로 숫자 표 전환 (색만으로 읽지 않도록)
import { useState } from "react";

const BAR_COLOR = "#ea580c"; // orange-600, 흰 배경 대비 3:1 이상
const W = 600;
const H = 180;
const PAD = { top: 12, right: 8, bottom: 22, left: 32 };

function niceMax(v) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v);
  return step * 4;
}

const md = (key) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;

export default function DailyBarChart({ title, unit = "건", data }) {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const total = data.reduce((s, d) => s + d.count, 0);
  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(2, slot - 2); // 막대 사이 2px 간격
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const h = hover != null ? data[hover] : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>30일 합계 {total.toLocaleString()}{unit}</span>
          <button type="button" className="underline" onClick={() => setShowTable((v) => !v)}>
            {showTable ? "그래프로 보기" : "표로 보기"}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="max-h-[220px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-slate-500">
              <tr><th className="py-1">날짜</th><th className="py-1 text-right">{unit}</th></tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-t border-slate-100">
                  <td className="py-1">{d.date}</td>
                  <td className="py-1 text-right tabular-nums">{d.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${title}, 30일 합계 ${total}${unit}`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
                <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
                  {t.toLocaleString()}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = PAD.left + i * slot + (slot - barW) / 2;
              const top = y(d.count);
              const bh = PAD.top + innerH - top;
              const r = Math.min(4, barW / 2, bh);
              return (
                <g key={d.date}>
                  {d.count > 0 && (
                    <path
                      d={`M${x},${top + bh} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${top + bh} Z`}
                      fill={BAR_COLOR}
                      opacity={hover == null || hover === i ? 1 : 0.45}
                    />
                  )}
                  {/* 막대보다 넓은 투명 영역으로 hover 잡기 */}
                  <rect
                    x={PAD.left + i * slot}
                    y={PAD.top}
                    width={slot}
                    height={innerH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onTouchStart={() => setHover(i)}
                  />
                </g>
              );
            })}
            {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
              <text key={i} x={PAD.left + i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#64748b">
                {md(data[i].date)}
              </text>
            ))}
          </svg>
          {h && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow"
              style={{ left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%` }}
            >
              {md(h.date)} · {h.count.toLocaleString()}{unit}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
