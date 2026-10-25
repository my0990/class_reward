"use client";
// 타이머 화면이 아닌 다른 화면(대시보드·관리·키오스크 등)에 있는 동안 타이머가 끝나면 토스트로 알려준다.
// 타이머는 이 탭의 sessionStorage에 상태를 기억한다 (hooks/timer/useCountdown, 키 kkyul:timer-state:<학급>).
// - 1초마다 그 값을 읽어 '돌아가는 중 + 끝나는 시각이 지났음'이면 한 번만 알림 (같은 끝 시각은 다시 알리지 않음)
// - 타이머 화면에 있을 때는 그 화면이 직접 소리·표시를 하므로 건너뜀
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

const stateKey = (classId) => `kkyul:timer-state:${classId}`;
const notifiedKey = (classId) => `kkyul:timer-notified:${classId}`;

export default function TimerDoneWatcher({ classId, linkToTimer = true }) {
  const pathname = usePathname();
  const onTimerPage = pathname?.startsWith(`/teacher/dashboard/${classId}/tools/timer`);

  useEffect(() => {
    if (!classId || onTimerPage) return undefined;
    const check = () => {
      try {
        const v = JSON.parse(sessionStorage.getItem(stateKey(classId)) || "null");
        if (v?.status !== "running" || !Number(v.endAt) || v.endAt > Date.now()) return;
        if (sessionStorage.getItem(notifiedKey(classId)) === String(v.endAt)) return; // 이미 알림
        sessionStorage.setItem(notifiedKey(classId), String(v.endAt));
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <span className="font-semibold">⏰ 타이머가 끝났어요</span>
              {linkToTimer && (
                <Link
                  href={`/teacher/dashboard/${classId}/tools/timer`}
                  onClick={() => toast.dismiss(t.id)}
                  className="rounded-lg bg-orange-500 px-3 py-1 text-sm font-semibold text-white"
                >
                  타이머 보기
                </Link>
              )}
            </div>
          ),
          { id: `timer-done-${classId}`, duration: 15000 }
        );
      } catch {}
    };
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, [classId, onTimerPage, linkToTimer]);

  return null;
}
