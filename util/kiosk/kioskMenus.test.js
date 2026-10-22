import { describe, it, expect } from "vitest";
import { isKioskMenuOn, cleanKioskMenus } from "./kioskMenus.js";

describe("키오스크 메뉴 보이기", () => {
  it("저장된 값이 없으면 보인다", () => {
    expect(isKioskMenuOn({}, "quest")).toBe(true);
    expect(isKioskMenuOn(null, "quest")).toBe(true);
    expect(isKioskMenuOn({ kioskMenus: { quest: false } }, "quest")).toBe(false);
    expect(isKioskMenuOn({ kioskMenus: { quest: false } }, "thermometer")).toBe(true);
  });
  it("모르는 키·불리언 아닌 값은 버린다", () => {
    expect(cleanKioskMenus({ quest: false, thermometer: "no", buy: false, $set: 1 })).toEqual({ quest: false });
  });
});
