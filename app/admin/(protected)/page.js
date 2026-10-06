import Link from "next/link";
import { getDashboardStatsService } from "@/server-action/service/admin/dashboard.service";
import DailyBarChart from "@/components/admin/DailyBarChart";
import { requireAdminPage } from "@/lib/auth/actionAuth";

const ACTION_LABEL = {
  login: "로그인",
  login_locked: "로그인 잠김",
  notice_create: "공지 등록",
  notice_update: "공지 수정",
  notice_delete: "공지 삭제",
  notice_pin: "공지 고정",
  notice_unpin: "공지 고정 해제",
  account_create: "관리자 계정 생성",
  account_reset: "관리자 비밀번호 변경",
  teacher_withdraw: "교사 회원 탈퇴",
};

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const fmtTime = (iso) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function AdminDashboard() {
  await requireAdminPage();
  const s = await getDashboardStatsService();
  const emailPct = Math.round((s.email.last24h / s.email.dailyLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <span className="text-xs text-slate-500">기준 {fmtTime(s.generatedAt)} · 새로고침하면 다시 계산합니다</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="교사" value={s.totals.teachers} sub={`최근 7일 접속 ${s.active.teachers7d} · 30일 ${s.active.teachers30d}`} />
        <Stat label="학생" value={s.totals.students} sub={`최근 7일 접속 ${s.active.students7d}`} />
        <Stat label="학급" value={s.totals.activeClasses} sub={`휴지통 ${s.totals.trashedClasses}`} />
        <Stat
          label="인증 메일 (24시간)"
          value={s.email.last24h}
          sub={`한도 ${s.email.dailyLimit}통 중 ${emailPct}%${emailPct >= 80 ? " ⚠️ 한도 가까움" : ""}`}
        />
      </div>
      <p className="text-xs text-slate-500">
        ※ 최근 접속 수는 접속 기록 기능을 넣은 뒤부터 쌓입니다. 처음 며칠은 실제보다 적게 보입니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyBarChart title="일별 교사 가입" unit="명" data={s.signupsByDay} />
        <DailyBarChart title="일별 화폐·아이템 기록" unit="건" data={s.historyByDay} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-semibold">최근 관리자 작업</h2>
          <Link href="/admin/notices" className="text-sm underline">공지 {s.totals.notices}개 관리</Link>
        </div>
        {s.recentAudit.length === 0 ? (
          <p className="text-sm text-slate-500">기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {s.recentAudit.map((a) => (
              <li key={a._id} className="flex flex-wrap gap-x-3 py-2">
                <span className="w-28 shrink-0 tabular-nums text-slate-500">{fmtTime(a.at)}</span>
                <span className="font-medium">{ACTION_LABEL[a.action] ?? a.action}</span>
                {a.detail && <span className="min-w-0 truncate text-slate-600">{a.detail}</span>}
                <span className="ml-auto text-slate-400">{a.adminEmail}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
