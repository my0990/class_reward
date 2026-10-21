// 관리자 대시보드: DB 용량 + 배포 상태 (서버 컴포넌트, 그래프만 클라이언트)
import { LineChart } from "@/components/admin/UsageTrends";

const MB = (b) => (b / 1024 / 1024).toFixed(1);

const fmtTime = (iso) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    new Date(iso)
  );

const STATE = {
  READY: { label: "완료", cls: "bg-emerald-100 text-emerald-800" },
  ERROR: { label: "실패", cls: "bg-red-100 text-red-800" },
  BUILDING: { label: "빌드 중", cls: "bg-amber-100 text-amber-800" },
  QUEUED: { label: "대기", cls: "bg-slate-100 text-slate-700" },
  INITIALIZING: { label: "준비 중", cls: "bg-slate-100 text-slate-700" },
  CANCELED: { label: "취소", cls: "bg-slate-100 text-slate-700" },
};

function Gauge({ percent }) {
  const color = percent >= 80 ? "bg-red-600" : percent >= 50 ? "bg-amber-500" : "bg-orange-600";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(percent, 0.5))}%` }} />
    </div>
  );
}

function DbCard({ db }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">DB 용량</h3>
        <span className="text-sm text-slate-500">무료 한도 512MB</span>
      </div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{MB(db.totalBytes)}MB</span>
        <span className="text-sm text-slate-500">
          {db.percent}%{db.percent >= 80 ? " ⚠️ 한도 가까움" : ""}
        </span>
      </div>
      <Gauge percent={db.percent} />
      <ul className="mt-3 space-y-1 text-sm">
        {db.dbs.map((d) => (
          <li key={d.name} className="flex justify-between gap-2">
            <span className="text-slate-600">{d.name}</span>
            <span className="tabular-nums text-slate-500">
              저장 {MB(d.storageSize)} · 인덱스 {MB(d.indexSize)}MB · 문서 {d.objects.toLocaleString()}개
            </span>
          </li>
        ))}
      </ul>
      {db.collections.length > 0 && (
        <>
          <div className="mt-3 text-xs font-medium text-slate-500">큰 컬렉션</div>
          <ul className="mt-1 space-y-1 text-sm">
            {db.collections.map((c) => (
              <li key={c.name} className="flex justify-between gap-2">
                <span className="min-w-0 truncate text-slate-600">{c.name}</span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {MB(c.bytes)}MB · {c.count.toLocaleString()}개
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function DeployCard({ deploy }) {
  const latest = deploy.recent?.[0];
  const stale = deploy.running && latest?.state === "READY" && latest.sha && latest.sha !== deploy.running.sha;
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">배포 상태</h3>
        <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-sm underline">
          Vercel 열기
        </a>
      </div>

      <div className="text-sm">
        <div className="text-xs font-medium text-slate-500">지금 실행 중인 버전</div>
        {deploy.running ? (
          <div className="mt-0.5">
            <code className="rounded bg-slate-100 px-1">{deploy.running.sha}</code>{" "}
            <span className="break-words text-slate-700">{deploy.running.message ?? ""}</span>
          </div>
        ) : (
          <div className="mt-0.5 text-slate-500">로컬 실행 중 (Vercel이 아님)</div>
        )}
      </div>

      {stale && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">
          최신 배포({latest.sha})와 지금 버전이 다릅니다. 새로고침해도 같으면 Vercel에서 Promote 상태를 확인하세요.
        </p>
      )}

      <div className="mt-3 text-xs font-medium text-slate-500">최근 배포</div>
      {!deploy.configured ? (
        <p className="mt-1 text-sm text-slate-500">
          Vercel 환경변수 <code>VERCEL_API_TOKEN</code>, <code>VERCEL_PROJECT_ID</code>를 넣으면 최근 배포 목록이 보입니다.
        </p>
      ) : deploy.error ? (
        <p className="mt-1 text-sm text-red-700">{deploy.error}</p>
      ) : deploy.recent.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">배포 기록이 없습니다.</p>
      ) : (
        <ul className="mt-1 divide-y divide-slate-100 text-sm">
          {deploy.recent.map((d) => {
            const st = STATE[d.state] ?? { label: d.state, cls: "bg-slate-100 text-slate-700" };
            return (
              <li key={d.id} className="flex items-center gap-2 py-1.5">
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                <span className="shrink-0 whitespace-nowrap tabular-nums text-slate-500">{fmtTime(d.createdAt)}</span>
                {d.sha && <code className="shrink-0 rounded bg-slate-100 px-1 text-xs">{d.sha}</code>}
                <span className="min-w-0 truncate text-slate-700">{d.message ?? ""}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function SystemStatus({ db, deploy }) {
  const trend = db.trend.map((t) => ({ key: t.key, value: t.bytes == null ? null : Math.round((t.bytes / 1024 / 1024) * 10) / 10 }));
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">서버 상태</h2>
        <div className="flex gap-3 text-sm">
          <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="underline">
            Vercel 사용량
          </a>
          <a href="https://cloud.mongodb.com/" target="_blank" rel="noreferrer" className="underline">
            Atlas 지표
          </a>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        DB 작업량·연결 수·네트워크와 Vercel 함수 실행량은 각 사이트에서 확인하세요. DB 용량 추이는 대시보드를 연 날의 값이 쌓입니다.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <DbCard db={db} />
        <LineChart title="DB 용량 추이" unit="MB" period="day" points={trend} />
        <DeployCard deploy={deploy} />
      </div>
    </section>
  );
}
