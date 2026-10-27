import { describe, it, expect } from "vitest";
import { maskText, cleanPath, firstFrame, errorFingerprint, isNoise, actionErrorMessage, summarizeUserAgent } from "./errorCore";

describe("개인 정보 가리기", () => {
  it("이메일·중복 키 값·토큰·비밀번호를 가린다", () => {
    expect(maskText("user Kim.T@School.kr not found")).toBe("user [email] not found");
    expect(maskText('E11000 duplicate key error dup key: { userId: "kim01" }')).toBe("E11000 duplicate key error dup key: {…}");
    expect(maskText("Bearer abc.def-123")).toBe("Bearer [token]");
    expect(maskText("/x?token=abc&password=1234&a=1")).toBe("/x?token=[hidden]&password=[hidden]&a=1");
    expect(maskText(undefined)).toBe("");
  });

  it("주소는 경로만 남긴다", () => {
    expect(cleanPath("https://kkyul.kr/teacher/dashboard/abc?tab=1#top")).toBe("/teacher/dashboard/abc");
    expect(cleanPath("/auth/reset-password?code=123")).toBe("/auth/reset-password");
    expect(cleanPath(null)).toBe("");
  });
});

describe("같은 에러 묶기", () => {
  const stackA = "TypeError: x is undefined\n    at Quest (webpack://app/quest.js:10:5)\n    at render (react.js:1:1)";
  const stackB = "TypeError: x is undefined\n    at Quest (webpack://app/quest.js:12:9)\n    at render (react.js:1:1)";

  it("줄 번호·숫자·id만 다르면 같은 에러", () => {
    expect(firstFrame(stackA)).toBe("at Quest (webpack://app/quest.js)");
    const a = errorFingerprint({ source: "client", message: "학생 3명 실패 64f1a2b3c4d5e6f708091a2b", stack: stackA });
    const b = errorFingerprint({ source: "client", message: "학생 12명 실패 0123456789abcdef01234567", stack: stackB });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });

  it("종류나 메시지가 다르면 다른 에러", () => {
    const base = { source: "client", message: "x is undefined", stack: stackA };
    expect(errorFingerprint(base)).not.toBe(errorFingerprint({ ...base, source: "render" }));
    expect(errorFingerprint(base)).not.toBe(errorFingerprint({ ...base, message: "y is undefined" }));
  });
});

describe("무시할 에러", () => {
  it("확장 프로그램·인터넷 끊김·Next 이동 신호는 무시", () => {
    expect(isNoise("ResizeObserver loop completed with undelivered notifications.")).toBe(true);
    expect(isNoise("Script error.")).toBe(true);
    expect(isNoise("boom", "at x (chrome-extension://abc/content.js:1:1)")).toBe(true);
    expect(isNoise("Failed to fetch")).toBe(true);
    expect(isNoise("NEXT_REDIRECT")).toBe(true);
    expect(isNoise("Cannot read properties of undefined (reading 'map')")).toBe(false);
  });

  it("버튼 실패 안내 문구", () => {
    expect(actionErrorMessage(new Error('Server Action "abc" was not found on the server.'))).toMatch(/새로고침/);
    expect(actionErrorMessage(new TypeError("Failed to fetch"))).toMatch(/인터넷/);
    expect(actionErrorMessage(new Error("boom"))).toMatch(/잠시 후/);
  });
});

describe("브라우저·기기 요약", () => {
  const UA = {
    ipad: "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    ipadDesktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    samsungTab: "Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Safari/537.36",
    whale: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Whale/3.28.266.14 Safari/537.36",
    kakao: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.5",
    chromebook: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  };
  it("짧게 요약한다", () => {
    expect(summarizeUserAgent(UA.ipad)).toBe("iPad · Safari 17");
    expect(summarizeUserAgent(UA.ipadDesktop)).toBe("Mac · Safari 17");
    expect(summarizeUserAgent(UA.ipadDesktop, { touch: true })).toBe("iPad · Safari 17");
    expect(summarizeUserAgent(UA.win)).toBe("Windows · Chrome 130");
    expect(summarizeUserAgent(UA.samsungTab)).toBe("Android 태블릿 · 삼성 인터넷 26");
    expect(summarizeUserAgent(UA.whale)).toBe("Windows · 웨일 3");
    expect(summarizeUserAgent(UA.kakao)).toBe("iPhone · 카카오톡 앱 10");
    expect(summarizeUserAgent(UA.chromebook)).toBe("크롬북 · Chrome 126");
    expect(summarizeUserAgent("")).toBeNull();
  });
});
