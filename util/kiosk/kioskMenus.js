// 키오스크 첫 화면 메뉴 중 선생님이 보이기/숨기기 할 수 있는 것
// class_data.kioskMenus: { thermometer: false } 처럼 저장. 값이 없으면 보인다(기본 보임).
export const KIOSK_TOGGLE_MENUS = [
  { key: "thermometer", label: "🌡️ 학급 온도계" },
  { key: "quest", label: "🏆 퀘스트" },
];

export const isKioskMenuOn = (classData, key) => classData?.kioskMenus?.[key] !== false;

/** 저장할 값만 골라 낸다 (모르는 키·불리언 아닌 값은 버림) */
export function cleanKioskMenus(input) {
  const out = {};
  for (const { key } of KIOSK_TOGGLE_MENUS) {
    if (typeof input?.[key] === "boolean") out[key] = input[key];
  }
  return out;
}
