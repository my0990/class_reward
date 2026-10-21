"use client";
// 학급 설정 > 키오스크 기기: 이 반에 연결된 키오스크 기기 목록, 원격으로 연결 끊기
// (기기 연결은 교실 기기의 키오스크 화면 > 오른쪽 위 설정에서 한다)
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { listKioskDevices, revokeKioskDevice } from "@/server-action/actions/kiosk/kioskSettings.action";

const fmt = (iso) =>
  iso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "-";

export default function KioskDevicesSection({ classId }) {
  const [list, setList] = useState(null);
  const [asking, setAsking] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await listKioskDevices({ classId });
    if (r?.result) setList(r.data);
    else toast.error(r?.message || "기기 목록을 불러오지 못했어요.");
  }, [classId]);
  useEffect(() => {
    load();
  }, [load]);

  const onRevoke = async (id) => {
    if (asking !== id) return setAsking(id);
    setBusy(true);
    try {
      const r = await revokeKioskDevice({ classId, deviceId: id });
      r?.result ? toast.success(r.message) : toast.error(r?.message || "연결을 끊지 못했어요.");
      setAsking(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-[20px] w-full max-w-[520px]">
      <h2 className="text-[1.2rem] font-bold">키오스크 기기</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        교실 기기의 키오스크 화면 오른쪽 위 <b>설정(톱니)</b>에서 「이 기기를 키오스크로 연결」을 누르면, 그 기기는 선생님 로그인이 풀리고 이
        반 키오스크로만 쓰여요. 학생이 선생님 화면에 들어갈 수 없어서 더 안전해요.
      </p>

      <div className="mt-4 space-y-2">
        {list === null ? (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">연결된 기기가 없어요.</p>
        ) : (
          list.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-white p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{d.name}</div>
                <div className="text-xs text-gray-500">
                  연결 {fmt(d.createdAt)} · 마지막 사용 {fmt(d.lastSeenAt)}
                </div>
              </div>
              {asking === d.id && (
                <button type="button" className="rounded-lg bg-gray-100 px-3 py-1 text-sm" onClick={() => setAsking(null)}>
                  취소
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => onRevoke(d.id)}
                className={`rounded-lg px-3 py-1 text-sm disabled:opacity-40 ${asking === d.id ? "bg-red-500 text-white" : "border border-red-300 text-red-500"}`}
              >
                {asking === d.id ? "정말 끊기" : "연결 끊기"}
              </button>
            </div>
          ))
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400">끊은 기기는 곧 로그인 화면으로 돌아가요. 90일 동안 쓰지 않은 기기는 자동으로 끊겨요.</p>
    </div>
  );
}
