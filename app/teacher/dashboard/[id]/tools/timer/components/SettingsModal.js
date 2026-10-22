"use client";
import { playCountdown, playDone, unlockSound, DONE_SOUNDS, DONE_REPEAT_MAX } from "@/util/timer/sounds";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { TIMER_THEMES } from "@/util/timer/timerMath";

export default function SettingsModal({ modalId, setModalId, settings, update }) {
  const toggles = [
    ["circle", "원형 타이머로 보기"],
    ["hideCount", "소음 횟수 숨기기"],
    ["muteAlert", "소음 경고음 끄기"],
    ["pointerHighlight", "마우스 강조 원 (가리킬 때)"],
  ];
  return (
    <ModalTemplate id="TIMER_SETTINGS" modalId={modalId} setModalId={setModalId} className="w-[420px] max-w-[95vw]">
      {/* ModalTemplate의 children은 함수({ close }) 형태 */}
      {() => (
      <div className="p-6">
      <h2 className="mb-5 text-xl font-bold">타이머 설정</h2>

      <label className="mb-1 flex justify-between text-sm font-semibold">
        <span>소음 측정 민감도</span>
        <span className="text-orange-500">{settings.sensitivity}</span>
      </label>
      <input
        type="range"
        min={1}
        max={100}
        value={settings.sensitivity}
        onChange={(e) => update({ sensitivity: Number(e.target.value) })}
        className="range range-warning range-sm mb-1"
      />
      <p className="mb-5 text-xs text-gray-500">숫자가 클수록 작은 소리에도 숫자가 크게 올라가요.</p>

      <label className="mb-1 block text-sm font-semibold">끝 알림음</label>
      <div className="mb-5 flex gap-2">
        <select
          value={settings.doneSound}
          onChange={(e) => {
            update({ doneSound: e.target.value });
            unlockSound();
            playDone(e.target.value); // 고르면 바로 들려준다
          }}
          className="select select-bordered select-sm flex-1"
        >
          {Object.entries(DONE_SOUNDS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            unlockSound();
            playDone(settings.doneSound);
          }}
          className="btn btn-sm"
          aria-label="끝 알림음 미리 듣기"
        >
          ▶ 듣기
        </button>
      </div>

      <label className="mb-1 block text-sm font-semibold">끝 알림음 횟수</label>
      <div className="mb-5 flex gap-1" role="radiogroup" aria-label="끝 알림음 횟수">
        {Array.from({ length: DONE_REPEAT_MAX }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={settings.doneRepeat === n}
            onClick={() => update({ doneRepeat: n })}
            className={`btn btn-sm flex-1 ${settings.doneRepeat === n ? "btn-warning" : "btn-ghost bg-gray-100"}`}
          >
            {n}번
          </button>
        ))}
      </div>

      <label className="mb-1 flex justify-between text-sm font-semibold">
        <span>알림음 크기</span>
        <span className="text-orange-500">{settings.volume}%</span>
      </label>
      <input
        type="range"
        min={50}
        max={200}
        step={10}
        value={settings.volume}
        onChange={(e) => update({ volume: Number(e.target.value) })}
        onPointerUp={() => playCountdown()}
        className="range range-warning range-sm mb-1"
      />
      <p className="mb-5 text-xs text-gray-500">놓으면 미리 들려줘요. 그래도 작으면 컴퓨터·스피커 볼륨을 올려 주세요.</p>

      <label className="mb-1 block text-sm font-semibold">테마</label>
      <select
        value={settings.theme}
        onChange={(e) => update({ theme: e.target.value })}
        className="select select-bordered select-sm mb-5 w-full"
      >
        {Object.entries(TIMER_THEMES).map(([key, t]) => (
          <option key={key} value={key}>
            {t.label}
          </option>
        ))}
      </select>

      <div className="space-y-3">
        {toggles.map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between">
            <span className="text-sm">{label}</span>
            <input
              type="checkbox"
              className="toggle toggle-warning toggle-sm"
              checked={settings[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
          </label>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">스페이스바: 시작·일시정지</p>
      </div>
      )}
    </ModalTemplate>
  );
}
