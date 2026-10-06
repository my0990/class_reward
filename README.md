# 학급 화폐 (class_reward)

초등학교 학급에서 쓰는 학급 화폐·보상 관리 웹앱입니다. 교사가 학생에게 화폐(기본: 🍪 쿠키)를 지급하고,
학생은 학급 마켓에서 아이템·프로필 이미지를 사거나 학급 온도계에 기부합니다.

## 주요 기능

| 대상 | 기능 |
|---|---|
| 교사 대시보드 | 학생 계정 생성/관리, 포인트 지급·회수, 마켓 아이템 등록, 퀘스트, 학급 온도계, 프로필 이미지, 공지, 랜덤 뽑기 |
| 키오스크 | 교사 계정으로 로그인한 교실 기기 한 대에서 학생이 비밀번호를 입력하고 구매·아이템 사용·기부 |
| 학생 대시보드 | 마켓, 인벤토리, 프로필 사진·칭호, 설정 |

## 기술 스택

Next.js 16 (App Router, Server Actions) · NextAuth (Credentials, JWT) · MongoDB · Tailwind CSS + daisyUI · SWR · Resend(이메일) · PWA(@ducanh2912/next-pwa) · Vitest

## 시작하기

```bash
npm install
cp .env.example .env.local   # 없으면 아래 표를 보고 직접 만든다
npm run dev                  # http://localhost:3000
```

### 환경 변수 (`.env.local`)

| 이름 | 설명 |
|---|---|
| `MONGODB_URI` | MongoDB 접속 주소 |
| `NEXTAUTH_SECRET` | NextAuth 세션 서명 키. 키오스크 결제 토큰 서명에도 쓴다 |
| `NEXTAUTH_URL` | 서비스 주소 (예: `http://localhost:3000`) |
| `EMAIL_CODE_HMAC_KEY` | 이메일 인증 코드 해시용 키 |
| `RESEND_API_KEY` | Resend API 키 (교사 회원가입 인증 메일) |
| `MAIL_FROM` | 인증 메일 보내는 주소 |
| `ADMIN_EMAILS` | 관리자 이메일 (쉼표로 여러 개). 여기 없는 이메일은 관리자 계정이 있어도 로그인 불가 |

> 실제 값은 절대 커밋하지 않는다. `.env*.local`은 `.gitignore`에 들어 있다.

## 테스트

```bash
npm test          # 전체 실행
npm run test:watch
npx vitest run market   # 파일 이름으로 골라서 실행
```

- 테스트는 `mongodb-memory-server`로 메모리 DB를 띄워서 실행한다. **진짜 DB는 건드리지 않는다.**
  처음 실행할 때 MongoDB 실행 파일을 내려받느라 1~2분 걸릴 수 있다.
- `master`에 push하거나 PR을 만들면 GitHub Actions가 자동으로 테스트를 돌린다 (`.github/workflows/test.yml`).

## 폴더 구조

```
app/
  api/                  조회용 API 라우트 (GET)
  teacher/              교사 대시보드, 키오스크(teacher/kiosk)
  student/              학생 대시보드
  auth/                 로그인, 회원가입
server-action/
  actions/              "use server" — 로그인/권한 확인 후 service 호출
  service/              DB 로직 (테스트 대상). *.test.js가 옆에 있다
lib/
  api/routeHelpers.js   API 라우트 공용: requireTeacher, requireMember, parseObjectId, withApiHandler
  auth/actionAuth.js    server action 공용: getTeacherId, authorizeTeacherClass(내 학급인지 확인)
  auth/kioskToken.js    키오스크 결제 토큰 (학생 비밀번호 확인 후 3분 유효)
  auth/studentTarget.js 구매/사용/기부 대상 학생 결정 (학생=본인만, 교사=토큰 필요)
util/                   숫자 변환 등 공용 함수
test/helpers/           테스트 공용 헬퍼 (메모리 DB)
```

## 응답 형식 규칙

- **server action**: 항상 `{ result: boolean, message?: string, data?: any }`를 돌려준다. 실패를 throw하지 않는다.
  (서비스 함수는 실패 시 Error를 던지고, action이 잡아서 `{ result: false, message }`로 바꾼다)
- **API 라우트(`app/api`)**: 성공하면 데이터를 그대로(200), 실패하면 `{ error: "메시지" }`와 HTTP 상태코드(400/401/403/404/429/500).
  화면에서는 `res.ok`로 성공 여부를 보고, 실패 메시지는 `data.error`를 쓴다. (`useFetchData`가 이미 이렇게 처리한다)

## 순서 규칙 (드래그로 순서 바꾸기)

순서 데이터는 **처음엔 없고, 선생님이 처음 순서를 바꿀 때 생긴다.** 순서 데이터가 없으면 아래 "기본 순서"로 보인다.
데이터 생김새가 달라서 세 곳의 저장 방식이 다르다.

| 대상 | 저장 위치 | 기본 순서 | 새로 추가하면 |
|---|---|---|---|
| 마켓 아이템 | `class_data.itemList` **배열 순서 자체** (별도 필드 없음) | 등록순 | 맨 뒤 |
| 퀘스트 | `quest.order` (0, 1, 2…) — 문서마다 | 최신순 | **맨 위** (order 없음 → 오름차순에서 숫자보다 앞) |
| 프로필 이미지 | `class_data.profileImgOrder` (urlId 배열) — `profileImgStorage`는 사전이라 순서가 없음 | 등록순 | 맨 뒤 |

- 아이템 순서는 `reorderItemsService`가 **DB 안에서 한 번에** 재배열한다 (그사이 재고 변경을 덮어쓰지 않게). 배열을 통째로 `$set`하지 말 것.
- 퀘스트 순서는 트랜잭션으로 한 번에 저장한다.
- 프로필 이미지 순서는 **화면에서 반드시 `orderedProfileImgIds(storage, profileImgOrder)`로** 나열한다 (`Object.keys` 직접 사용 금지).
  이미지를 지우면 `profileImgOrder`에서도 빠지고, 순서 저장 시 실제 있는 이미지만 남긴다.

## 보안 규칙 (코드를 고칠 때 지켜야 할 것)

- **교사용 action은 `authorizeTeacherClass(classId)`로 시작한다.** 로그인 여부만 보면 학생도 실행할 수 있다.
- **학생 돈·아이템을 움직이는 action은 `resolveStudentTarget`으로 대상 학생을 정한다.**
  학생은 본인만, 키오스크(교사 세션)는 학생 비밀번호 확인 토큰이 있어야 한다.
- **가격·잔액은 클라이언트가 보낸 값을 믿지 않는다.** 서버가 DB에서 읽어서 계산한다.
- **돈이 오가는 작업은 트랜잭션 + 조건부 차감**(`money: { $gte: price }`)으로 동시 요청을 막는다.
- **숫자는 정수(number)로 저장한다.** 입력값은 `toNonNegativeInt`로 변환한다. 문자열 가격이 저장되면 구매가 실패한다.
- **없는 문서를 `upsert`로 만들지 않는다.** 학급 문서는 학급을 만들 때만 생긴다.

## 관리자

- 주소: `/admin/login` → `/admin`(대시보드), `/admin/notices`(공지 등록·수정·삭제·고정)
- 계정 만들기 (비밀번호는 화면에 안 보이게 입력, 10자 이상):
  ```bash
  # 1) .env.local(그리고 Vercel)에 ADMIN_EMAILS=you@example.com
  npm run admin:create -- --email you@example.com
  npm run admin:create -- --email you@example.com --reset   # 비밀번호 바꾸기 + 잠금 풀기
  ```
- 계정은 `admins.accounts`에 따로 저장한다 (교사 계정과 같은 이메일이어도 된다).
- 보안: 5번 틀리면 15분 잠금, 세션 12시간, `ADMIN_EMAILS`에서 빼면 5분 안에 권한이 사라진다.
  관리자 세션으로는 교사/학생 화면과 API를 쓸 수 없다.
- 관리자 작업(로그인, 공지 등록/수정/삭제/고정)은 `admins.audit_log`에 남는다.
- 대시보드는 개수만 보여준다 (교사 목록 없음). "최근 접속"은 로그인과 5분마다의 세션 확인 때 갱신되는 `lastSeenAt` 기준이다.

## 화면 테스트 (Playwright)

키오스크 구매·사용, 학생 첫 로그인, 로그인 잠금, 404 화면을 실제 브라우저로 확인한다.
메모리 DB에 테스트 데이터를 넣고 포트 3100에 따로 서버를 띄우므로 **진짜 DB와 개발 서버(3000)는 건드리지 않는다.**

```bash
# 처음 한 번
npm i -D @playwright/test
npx playwright install chromium

npm run test:e2e              # 전체
npm run test:e2e -- --headed  # 브라우저 창을 띄워서 보기
```

- 테스트 데이터: `e2e/seed.mjs` (교사 1명, 학급 1개, 학생 3명, 아이템 1개)
- 실패하면 `test-results/`에 화면 기록(trace)이 남는다: `npx playwright show-trace test-results/.../trace.zip`

