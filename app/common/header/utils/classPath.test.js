import { describe, it, expect } from "vitest";
import { switchClassPath } from "./classPath.js";

const A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const B = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("switchClassPath (학급 바꾸기 주소)", () => {
  it("보던 메뉴를 유지하고 학급 id만 바꾼다", () => {
    expect(switchClassPath(`/teacher/dashboard/${A}/quest`, A, B)).toBe(`/teacher/dashboard/${B}/quest`);
    expect(switchClassPath(`/teacher/dashboard/${A}/tools/random`, A, B)).toBe(`/teacher/dashboard/${B}/tools/random`);
  });

  it("대시보드 첫 화면이면 그대로 첫 화면", () => {
    expect(switchClassPath(`/teacher/dashboard/${A}`, A, B)).toBe(`/teacher/dashboard/${B}`);
  });

  it("주소에 학급 id가 없으면 바꿀 학급의 대시보드로", () => {
    expect(switchClassPath("/teacher/classes", A, B)).toBe(`/teacher/dashboard/${B}`);
    expect(switchClassPath(null, A, B)).toBe(`/teacher/dashboard/${B}`);
  });

  it("학급 id가 다른 id의 앞부분과 겹쳐도 잘못 바꾸지 않는다", () => {
    expect(switchClassPath(`/teacher/dashboard/${A}x/quest`, A, B)).toBe(`/teacher/dashboard/${B}`);
  });
});
