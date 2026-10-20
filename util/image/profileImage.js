// 학생 프로필 사진을 화면 크기에 맞는 작은 파일로 불러오기
// 기본 프로필 사진은 pixabay의 1280px PNG(장당 100KB~1.2MB)라서, 키오스크에 학생 25명을 띄우면 사진만 수 MB였다.
// pixabay는 같은 사진을 _640(가로 640px)·_150(150px) 크기로도 준다 → 화면 크기에 맞춰 바꿔 부른다.
// 작은 파일이 없으면(onError) 원래 주소로 다시 불러온다.

const PIXABAY = /^(https:\/\/cdn\.pixabay\.com\/photo\/.+)_(?:1280|640|150)\.(png|jpg|jpeg)$/i;

/** 표시 크기(px)에 맞는 주소. 선명하게 보이도록 1.5배 이상인 파일을 고른다 */
export function smallImageUrl(url, displayPx = 100) {
  const m = typeof url === "string" ? url.match(PIXABAY) : null;
  if (!m) return url;
  const size = displayPx * 1.5 <= 150 ? 150 : 640;
  return `${m[1]}_${size}.${m[2]}`;
}

/** <img {...profileImgProps(url, 100)} /> : 작은 파일 + 실패하면 원래 주소로 */
export function profileImgProps(url, displayPx = 100) {
  const src = smallImageUrl(url, displayPx);
  return {
    src,
    loading: "lazy",
    decoding: "async",
    onError: (e) => {
      if (url && e.currentTarget.src !== url) e.currentTarget.src = url;
    },
  };
}
