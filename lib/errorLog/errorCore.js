// 에러 기록 공용 규칙 (서버·브라우저 둘 다 씀): 개인 정보 가리기, 길이 자르기, 같은 에러 묶기, 무시할 에러
//
// 저장하지 않는 것: 이메일, 토큰·비밀번호, 중복 키 값(아이디가 들어 있음), 주소의 ?쿼리
export const LIMITS = { message: 500, stack: 3000, path: 200 };

/** 어디서 난 에러인지 */
export const SOURCES = ["server", "api", "action", "client", "render", "client-action"];
/** 브라우저가 보낼 수 있는 종류 */
export const CLIENT_SOURCES = ["client", "render", "client-action"];

/** 메시지·스택에서 개인 정보로 보이는 부분을 가린다 */
export function maskText(s) {
  return String(s ?? "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/dup key: \{[^}]*\}/g, "dup key: {…}")
    .replace(/(Bearer\s+)[\w.~+/=-]+/gi, "$1[token]")
    .replace(/\b(token|password|pwd|secret|code)=([^&\s"']+)/gi, "$1=[hidden]");
}

/** 주소에서 도메인·?쿼리·#해시를 빼고 경로만 */
export function cleanPath(p) {
  let s = String(p ?? "");
  try {
    if (/^https?:\/\//i.test(s)) s = new URL(s).pathname;
  } catch {
    /* 그대로 */
  }
  return s.split(/[?#]/)[0].slice(0, LIMITS.path);
}

/** 스택에서 첫 번째 코드 위치 (줄·칸 번호는 빼서 배포가 바뀌어도 최대한 같은 에러로 묶이게) */
export function firstFrame(stack) {
  const lines = String(stack ?? "").split("\n").map((l) => l.trim());
  const frame = lines.find((l) => l.startsWith("at ") || /@\S+:\d+/.test(l)) ?? "";
  return frame.replace(/\?[^\s)]*/g, "").replace(/:\d+(:\d+)?/g, "");
}

/** 같은 에러끼리 묶는 열쇠: 종류 + 메시지(숫자·id는 지움) + 첫 코드 위치 */
export function errorFingerprint({ source, message, stack }) {
  const msg = String(message ?? "")
    .replace(/\b[0-9a-f]{24}\b/gi, ":id")
    .replace(/\d+/g, "N")
    .slice(0, 200);
  const text = `${source}|${msg}|${firstFrame(stack)}`;
  // FNV-1a 32bit 두 번 (브라우저·서버 공용, 라이브러리 없이)
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x811c9dc5) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

// 기록해도 고칠 수 없거나 정상 동작인 것: 브라우저 확장 프로그램, 인터넷 끊김, Next의 이동(redirect) 신호 등
const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /(chrome|moz|safari|safari-web)-extension:/i,
  /Non-Error promise rejection captured/i,
  /NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK/,
  /AbortError|The user aborted a request|signal is aborted/i,
  /^(TypeError: )?(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.?)$/i,
];

export function isNoise(message, stack = "") {
  const m = String(message ?? "").trim();
  if (!m) return false;
  return NOISE.some((re) => re.test(m) || re.test(String(stack ?? "")));
}

/** 버튼(서버 액션)이 실패했을 때 보여줄 말 */
export function actionErrorMessage(error) {
  const m = String(error?.message ?? error ?? "");
  if (/server action/i.test(m) && /(not found|failed to find)/i.test(m)) {
    return "뀰이 새로 업데이트됐어요. 새로고침 후 다시 시도해주세요.";
  }
  if (/failed to fetch|load failed|networkerror|network/i.test(m)) {
    return "인터넷 연결을 확인하고 다시 시도해주세요.";
  }
  return "처리하지 못했어요. 잠시 후 다시 시도해주세요.";
}
