// 관리자 대시보드 '기능 사용량'에서 세는 기능 목록 (서버·브라우저 공용)
// client: true → 화면에서만 도는 기능이라 브라우저가 /api/feature-usage로 알려준다
export const FEATURES = {
  currency_give: { label: "화폐 지급" },
  currency_take: { label: "화폐 회수" },
  quest_finish: { label: "퀘스트 완료 처리" },
  quest_request: { label: "키오스크 퀘스트 신청" },
  request_decide: { label: "승인 센터 처리" },
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
};

export const FEATURE_KEYS = Object.keys(FEATURES);
export const CLIENT_FEATURE_KEYS = FEATURE_KEYS.filter((k) => FEATURES[k].client);
export const isFeature = (k) => Object.hasOwn(FEATURES, k);
