"use client";
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
