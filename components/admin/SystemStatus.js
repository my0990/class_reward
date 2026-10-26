// 관리자 대시보드: DB 용량 + 배포 상태 (서버 컴포넌트, 그래프만 클라이언트)
import { LineChart } from "@/components/admin/UsageTrends";

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

// 컬렉션 → 화면에 보일 이름
const COLLECTION_LABEL = {
  "data.history": "거래 기록",
  "data.user_data": "학생 데이터",
  "data.class_data": "학급 정보",
  "data.classes": "학급 목록",
  "data.quest": "퀘스트",
  "data.thermometer": "학급 온도계",
  "user.users": "로그인 계정",
  "user.email_verifications": "이메일 인증",
  "user.email_send_log": "메일 발송 기록",
  "user.kiosk_pwd_attempts": "키오스크 비밀번호 시도",
  "user.kiosk_devices": "키오스크 기기",
  "user.login_attempts": "로그인 실패 기록",
  "user.password_resets": "비밀번호 찾기",
  "admins.notices": "공지",
  "admins.audit_log": "관리자 작업 기록",
  "admins.accounts": "관리자 계정",
  "admins.admin_login_attempts": "관리자 로그인 시도",
  "admins.daily_usage": "일별 이용 통계",
  "admins.period_usage": "주·월별 이용 통계",
  "admins.db_size": "DB 용량 기록",
  "admins.error_logs": "에러 기록",
};
const DB_LABEL = { user: "계정", data: "학급·학생", admins: "관리자" };
const SHOW_TOP = 6;

/** 크기를 읽기 쉽게: 1MB 미만은 KB */
function size(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function Gauge({ percent }) {
  const color = percent >= 80 ? "bg-red-600" : percent >= 50 ? "bg-amber-500" : "bg-orange-600";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(percent, 0.5))}%` }} />
    </div>
  );
}

function UsageRow({ label, bytes, total, count }) {
  const share = total > 0 ? (bytes / total) * 100 : 0;
  return (
    <li className="grid grid-cols-[minmax(0,7.5rem)_minmax(3rem,1fr)_3.75rem_2.25rem_4.5rem] items-center gap-2 py-1 text-sm">
      <span className="truncate text-slate-800">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.max(share, 1)}%` }} />
      </div>
      <span className="text-right font-medium tabular-nums text-slate-800">{size(bytes)}</span>
      <span className="text-right text-xs tabular-nums text-slate-500">{Math.round(share)}%</span>
      <span className="text-right text-xs tabular-nums text-slate-500">{count.toLocaleString()}개</span>
    </li>
  );
}

function DbCard({ db }) {
  const used = db.totalBytes;
  const left = Math.max(0, db.limitBytes - used);
  const top = db.collections.slice(0, SHOW_TOP);
  const rest = db.collections.slice(SHOW_TOP);
  const restBytes = rest.reduce((a, c) => a + c.bytes, 0);
  const restCount = rest.reduce((a, c) => a + c.count, 0);
  // 컬렉션 합계 기준 비율 (DB 전체 크기와 약간 다를 수 있음)
  const listTotal = db.collections.reduce((a, c) => a + c.bytes, 0);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold">DB 용량</h3>
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* 왼쪽: 전체 사용량 + DB별 */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="tabular-nums">
              <span className="text-2xl font-bold">{size(used)}</span>
              <span className="ml-1 text-sm text-slate-500">/ 512MB</span>
            </div>
            <span className={`text-sm font-medium ${db.percent >= 80 ? "text-red-700" : "text-slate-600"}`}>
              {db.percent}% 사용{db.percent >= 80 ? " ⚠️" : ""}
            </span>
          </div>
          <div className="mt-1.5">
            <Gauge percent={db.percent} />
          </div>
          <div className="mt-1 text-xs text-slate-500">남은 용량 {size(left)}</div>

          <table className="mt-4 w-full text-xs tabular-nums">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-1 font-normal">DB별</th>
                <th className="py-1 text-right font-normal">데이터</th>
                <th className="py-1 text-right font-normal">인덱스</th>
                <th className="py-1 text-right font-normal">문서</th>
              </tr>
            </thead>
            <tbody>
              {db.dbs.map((d) => (
                <tr key={d.name} className="border-t border-slate-100">
                  <td className="py-1 text-slate-700">{DB_LABEL[d.name] ?? d.name}</td>
                  <td className="py-1 text-right">{size(d.storageSize)}</td>
                  <td className="py-1 text-right">{size(d.indexSize)}</td>
                  <td className="py-1 text-right">{d.objects.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 오른쪽: 어디에 쓰이나 */}
        {top.length > 0 && (
          <div className="min-w-0">
            <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(3rem,1fr)_3.75rem_2.25rem_4.5rem] gap-2 text-xs text-slate-500">
              <span>어디에 쓰이나</span>
              <span />
              <span className="text-right">크기</span>
              <span className="text-right">비율</span>
              <span className="text-right">문서</span>
            </div>
            <ul className="mt-1 divide-y divide-slate-50">
              {top.map((c) => (
                <UsageRow key={c.name} label={COLLECTION_LABEL[c.name] ?? c.name} bytes={c.bytes} total={listTotal} count={c.count} />
              ))}
              {rest.length > 0 && <UsageRow label={`기타 ${rest.length}개`} bytes={restBytes} total={listTotal} count={restCount} />}
            </ul>
          </div>
        )}
      </div>
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
    <section className="space-y-3">
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
      <DbCard db={db} />
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart title="DB 용량 추이" unit="MB" period="day" points={trend} />
        <DeployCard deploy={deploy} />
      </div>
    </section>
  );
}
