import { getToken } from "next-auth/jwt"
import { buyItemService } from '@/server-action/service/market/market.service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false, message: 'Method Not Allowed' });
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { itemData } = req.body ?? {};
  if (!itemData?.itemId) {
    return res.status(400).json({ result: false, message: '잘못된 요청입니다.' });
  }

  // 이 API는 두 가지 경로에서 호출된다.
  //  1) 학생이 자기 계정으로 로그인해서 직접 구매 (student dashboard market)
  //     → userId/classId/teacher_id를 클라이언트가 보낸 값이 아니라
  //       서버가 들고 있는 로그인 토큰 값만 사용한다 (IDOR 방지).
  //  2) 교사가 kiosk 기기에 로그인한 상태로 특정 학생을 대신 결제
  //     (teacher/kiosk/[id]/buy) → 이 기기엔 학생 개별 로그인 세션이 없으므로
  //     token은 교사 세션이고, userId/classId는 요청 본문에서 받는다.
  //     대신 teacher_id는 반드시 토큰(로그인된 교사) 값만 쓰고, 서비스에서
  //     모든 DB 조회/수정을 teacher_id+classId로 다시 스코핑한다.
  // 실제 구매 로직은 buyItemService(market.service.js)에 있고 테스트로 검증한다.
  let teacher_id;
  let classId;
  let userId;

  if (
    token?.user?.role === 'student' &&
    token?.user?.userId &&
    token?.user?.classId &&
    token?.user?.teacher_id
  ) {
    teacher_id = token.user.teacher_id;
    classId = token.user.classId;
    userId = token.user.userId;
  } else if (token?.user?.role === 'teacher' && token?.user?.teacher_id) {
    teacher_id = token.user.teacher_id;
    classId = req.body?.classId;
    userId = req.body?.userId;

    if (!classId || !userId) {
      return res.status(400).json({ result: false, message: '잘못된 요청입니다.' });
    }
  } else {
    return res.status(401).json({ result: false, message: '로그인이 필요합니다.' });
  }

  try {
    const { itemId } = await buyItemService({
      teacher_id,
      classId,
      userId,
      itemId: itemData.itemId,
    });

    return res.status(200).json({ result: true, message: 'buy 성공', itemId });
  } catch (error) {
    const status = error.status ?? 500;
    return res.status(status).json({ result: false, message: error.message || '구매 처리 중 오류가 발생했습니다.' });
  }
}
