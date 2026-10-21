"use client";
// 키오스크 첫 화면 오른쪽 위 설정(톱니) 버튼 + 설정 창
// - 열 때 선생님 비밀번호 확인 (5번 틀리면 10분 동안 버튼이 잠김, 남은 시간 표시)
// - 선생님 로그인 기기: 「이 기기를 키오스크로 연결」 → 이 기기는 키오스크 전용(선생님 로그인 풀림)
// - 연결된 기기: 기기 이름 바꾸기, 연결 끊기
// - 창을 닫으면 다음에 다시 비밀번호를 묻는다
import { useCallback, useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import {
  kioskSettingsStatus,
  unlockKioskSettings,
  pairKioskDevice,
  renameThisKioskDevice,
  unpairThisKioskDevice,
} from "@/server-action/actions/kiosk/kioskSettings.action";

const MODAL_ID = "KIOSK_SETTINGS";
const fmtDate = (d) => (d ? new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(d)) : "");

export default function KioskSettings({ classId }) {
  const [modalId, setModalId] = useState(null);
  const [lockedSec, setLockedSec] = useState(0);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(null); // { settingsToken, info }
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false); // 연결/끊기 한 번 더 확인

  // 처음: 잠겨 있는지
  useEffect(() => {
    kioskSettingsStatus({ classId }).then((r) => r?.result && setLockedSec(r.lockedSec));
  }, [classId]);

  // 잠긴 동안 1초마다 남은 시간 줄이기
  useEffect(() => {
    if (lockedSec <= 0) return undefined;
    const t = setTimeout(() => setLockedSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [lockedSec]);

  const reset = useCallback(() => {
    setPassword("");
    setError("");
    setUnlocked(null);
    setName("");
    setConfirming(false);
  }, []);

  const open = () => {
    if (lockedSec > 0) return;
    reset();
    setModalId(MODAL_ID);
  };

  const onUnlock = async (e) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    try {
      const r = await unlockKioskSettings({ classId, password });
      if (r?.result) {
        setUnlocked({ settingsToken: r.settingsToken, info: r.info });
        setName(r.info.device?.name ?? "");
        setPassword("");
        setError("");
        return;
      }
      setPassword("");
      setError(r?.message || "비밀번호를 확인해 주세요.");
      if (r?.lockedSec > 0) {
        setLockedSec(r.lockedSec);
        setModalId(null);
        toast.error(r.message);
      }
      if (r?.revoked) window.location.replace("/");
    } finally {
      setBusy(false);
    }
  };

  const onPair = async () => {
    if (!confirming) return setConfirming(true);
    setBusy(true);
    try {
      const r = await pairKioskDevice({ classId, settingsToken: unlocked.settingsToken, name });
      if (!r?.result) {
        toast.error(r?.message || "연결하지 못했어요.");
        return;
      }
      // 선생님 로그인 → 이 반 키오스크 로그인으로 바꾼다
      const res = await signIn("credentials", { role: "kiosk", token: r.pairToken, redirect: false });
      if (res?.error) {
        toast.error("연결은 됐지만 키오스크로 로그인하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      window.location.replace(`/teacher/kiosk/${classId}`);
    } finally {
      setBusy(false);
    }
  };

  const onRename = async () => {
    setBusy(true);
    try {
      const r = await renameThisKioskDevice({ classId, settingsToken: unlocked.settingsToken, name });
      r?.result ? toast.success(r.message) : toast.error(r?.message || "이름을 바꾸지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const onUnpair = async () => {
    if (!confirming) return setConfirming(true);
    setBusy(true);
    try {
      const r = await unpairThisKioskDevice({ classId, settingsToken: unlocked.settingsToken });
      if (!r?.result) {
        toast.error(r?.message || "연결을 끊지 못했어요.");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } finally {
      setBusy(false);
    }
  };

  const mins = Math.ceil(lockedSec / 60);
  const info = unlocked?.info;

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={lockedSec > 0}
        aria-label="키오스크 설정"
        title={lockedSec > 0 ? `${mins}분 뒤에 다시 시도할 수 있어요` : "키오스크 설정"}
        className="flex items-center gap-1 rounded-full bg-white/80 p-2 text-orange-700 shadow-md transition hover:bg-white disabled:opacity-50"
      >
        <Cog6ToothIcon className="h-7 w-7" />
        {lockedSec > 0 && <span className="pr-1 text-sm font-bold">{mins}분 뒤</span>}
      </button>

      <ModalTemplate id={MODAL_ID} modalId={modalId} setModalId={setModalId} onClose={reset} className="w-[440px] max-w-[95vw]">
        {() => (
          <div className="p-6">
            <h2 className="mb-4 text-xl font-bold">키오스크 설정</h2>

            {!unlocked ? (
              <form onSubmit={onUnlock}>
                <label htmlFor="kioskSettingsPw" className="mb-1 block text-sm text-gray-600">
                  선생님 비밀번호를 입력하세요
                </label>
                <input
                  id="kioskSettingsPw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  className="w-full rounded-lg border p-2"
                />
                <p className="mt-1 min-h-[20px] text-sm text-red-500">{error}</p>
                <p className="mb-4 text-xs text-gray-400">5번 틀리면 10분 동안 설정을 열 수 없어요.</p>
                <button type="submit" disabled={!password || busy} className="w-full rounded-lg bg-orange-500 py-2 font-bold text-white disabled:opacity-40">
                  {busy ? "확인 중..." : "확인"}
                </button>
              </form>
            ) : info.mode === "teacher" ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                  지금 이 기기는 <b>선생님 계정</b>으로 로그인되어 있어요. 학생이 주소를 바꾸면 선생님 화면에 들어갈 수 있어요.
                  <br />
                  연결하면 이 기기에서 선생님 로그인이 풀리고 <b>{info.className} 키오스크</b>로만 쓰입니다.
                </div>
                <label className="block text-sm text-gray-600">
                  기기 이름 (선택)
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    placeholder="예: 교실 태블릿 1"
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>
                <button
                  type="button"
                  onClick={onPair}
                  disabled={busy}
                  className={`w-full rounded-lg py-2 font-bold text-white disabled:opacity-40 ${confirming ? "bg-red-500" : "bg-orange-500"}`}
                >
                  {busy ? "연결 중..." : confirming ? "선생님 로그인을 풀고 연결할게요" : "이 기기를 키오스크로 연결"}
                </button>
                <p className="text-xs text-gray-400">연결을 끊을 때도 이 설정에서 선생님 비밀번호로 끊을 수 있어요. 선생님 화면 &gt; 설정 &gt; 키오스크 기기에서 원격으로도 끊을 수 있어요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-3 text-sm leading-6 text-green-800">
                  <b>{info.className} 키오스크</b>로 연결된 기기예요 ({fmtDate(info.device?.createdAt)} 연결).
                  <br />
                  이 기기에서는 선생님 화면에 들어갈 수 없어요.
                </div>
                <label className="block text-sm text-gray-600">
                  기기 이름
                  <div className="mt-1 flex gap-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="min-w-0 flex-1 rounded-lg border p-2" />
                    <button type="button" onClick={onRename} disabled={busy} className="rounded-lg bg-gray-100 px-3 text-sm disabled:opacity-40">
                      저장
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={onUnpair}
                  disabled={busy}
                  className={`w-full rounded-lg py-2 font-bold disabled:opacity-40 ${confirming ? "bg-red-500 text-white" : "border border-red-300 text-red-500"}`}
                >
                  {busy ? "끊는 중..." : confirming ? "정말 끊을게요 (로그인 화면으로)" : "키오스크 연결 끊기"}
                </button>
              </div>
            )}
          </div>
        )}
      </ModalTemplate>
    </>
  );
}
