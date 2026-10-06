import base from "@/public/manifest.json";

// 키오스크 전용 manifest: 홈 화면 아이콘을 누르면 바로 이 학급의 키오스크가 열린다.
// (manifest 요청에는 로그인 쿠키가 실리지 않아서 /teacher 아래가 아닌 /api에 둔다. 학급 id 말고는 정보가 없다.)
export async function GET(req, { params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id ?? "")) {
    return Response.json({ error: "잘못된 학급입니다." }, { status: 400 });
  }
  const kioskPath = `/teacher/kiosk/${id}`;
  const manifest = {
    ...base,
    id: kioskPath,
    name: "뀰 키오스크",
    short_name: "뀰 키오스크",
    description: "학생용 아이템 구매·사용, 학급 온도계 키오스크",
    start_url: kioskPath,
    scope: kioskPath,
    display: "fullscreen",
    orientation: "any",
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
