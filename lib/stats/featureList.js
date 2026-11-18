// 관리자 대시보드 '기능 사용량'에서 세는 기능 목록 (서버·브라우저 공용)
// client: true → 화면에서만 도는 기능이라 브라우저가 /api/feature-usage로 알려준다
// guest: true → 로그인 없이 쓰는 비회원 도구(/tools). 브라우저가 /api/guest-usage로 알려준다 (횟수만, 누가인지 모름)
export const FEATURES = {
  currency_give: { label: "화폐 지급" },
  currency_take: { label: "화폐 회수" },
  quest_finish: { label: "퀘스트 완료 처리" },
  quest_request: { label: "키오스크 퀘스트 신청" },
  request_decide: { label: "승인 센터 처리" },
  rep_request: { label: "대표 화폐 신청" },
  item_buy: { label: "아이템 구매" },
  item_use: { label: "아이템 사용" },
  donate: { label: "온도계 기부" },
  seat_confirm: { label: "자리 바꾸기" },
  kiosk_login: { label: "키오스크 사용" },
  random_pick: { label: "번호 뽑기", client: true },
  timer_start: { label: "타이머 시작", client: true },
  noise_meter: { label: "소음 측정", client: true },
  board_open: { label: "판서", client: true },
  history_view: { label: "학급 기록 보기", client: true },
  guest_timer_visit: { label: "타이머 방문", guest: true },
  guest_timer_start: { label: "타이머 시작", guest: true },
  guest_timer_weekly: { label: "타이머 주간 방문", guest: true, hidden: true }, // 같은 브라우저 주 1번 (주간 방문자 수용)
  guest_seat_visit: { label: "자리 바꾸기 방문", guest: true },
  guest_seat_weekly: { label: "자리 바꾸기 주간 방문", guest: true, hidden: true },
  guest_seat_shuffle: { label: "자리 섞기", guest: true },
  guest_seat_save: { label: "자리 저장", guest: true },
  guest_seat_print: { label: "자리표 인쇄", guest: true },
  guest_signup_click: { label: "가입하기 클릭", guest: true },
};

export const FEATURE_KEYS = Object.keys(FEATURES);
export const CLIENT_FEATURE_KEYS = FEATURE_KEYS.filter((k) => FEATURES[k].client);
export const GUEST_FEATURE_KEYS = FEATURE_KEYS.filter((k) => FEATURES[k].guest);
export const isFeature = (k) => Object.hasOwn(FEATURES, k);
