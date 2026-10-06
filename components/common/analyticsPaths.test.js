import { describe, it, expect } from "vitest";
import { isAnalyticsAllowed } from "./analyticsPaths.js";

describe("방문 통계는 선생님 화면에서만", () => {
  it.each([
    ["/teacher/classes", true],
    ["/teacher/dashboard/abc/manage", true],
    ["/auth/login/teacher", true],
    ["/auth/signup", true],
    ["/teacher/kiosk/abc", false],
    ["/teacher/kiosk/abc/buy", false],
    ["/student/dashboard/abc", false],
    ["/auth/login/student", false],
    ["/", false],
    ["/admin", false],
    ["/privacy", false],
    ["/teachers", false],
  ])("%s → %s", (path, expected) => {
    expect(isAnalyticsAllowed(path)).toBe(expected);
  });
});
