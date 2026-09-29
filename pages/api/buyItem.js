import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb';
import { getToken } from "next-auth/jwt"

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false, message: 'Method Not Allowed' });
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // userId / classId / teacher_id는 클라이언트가 보낸 값을 신뢰하지 않고
  // 서버가 들고 있는 로그인 토큰 값만 사용한다 (IDOR 방지).
  if (!token?.user?.userId || !token?.user?.classId || !token?.user?.teacher_id) {
    return res.status(401).json({ result: false, message: '로그인이 필요합니다.' });
  }

  const { itemData } = req.body ?? {};
  if (!itemData?.itemId) {
    return res.status(400).json({ result: false, message: '잘못된 요청입니다.' });
  }

  const userId = token.user.userId;
  const ItemId = itemData.itemId;

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(token.user.teacher_id);
    classObjectId = ObjectId.createFromHexString(token.user.classId);
  } catch {
    return res.status(400).json({ result: false, message: '잘못된 학급 정보입니다.' });
  }

  const client = await connectDB;
  const db = client.db('data');
  const session = client.startSession();

  let purchasedItemId = null;

  try {
    await session.withTransaction(async () => {
      const classData = await db.collection('class_data').findOne(
        { teacher_id: teacherObjectId, classId: classObjectId },
        { session }
      );
      if (!classData) {
        throw Object.assign(new Error('학급 정보를 찾을 수 없습니다.'), { status: 404 });
      }

      // 가격/이름/이모지 등은 클라이언트 입력이 아니라 서버가 조회한
      // 카탈로그(class_data.itemList) 값을 그대로 사용한다.
      const item = classData.itemList?.find((i) => i.itemId === ItemId);
      if (!item) {
        throw Object.assign(new Error('존재하지 않는 아이템입니다.'), { status: 404 });
      }

      const studentData = await db.collection('user_data').findOne(
        { userId, role: 'student' },
        { session }
      );
      if (!studentData) {
        throw Object.assign(new Error('사용자 정보를 찾을 수 없습니다.'), { status: 404 });
      }

      const price = item.itemPrice;

      if (studentData.money < price) {
        throw Object.assign(new Error('잔액부족'), { status: 400 });
      }

      // 재고가 남아있을 때만 원자적으로 차감 (동시 요청에 의한 오버셀 방지)
      const stockUpdate = await db.collection('class_data').updateOne(
        {
          teacher_id: teacherObjectId,
          classId: classObjectId,
          itemList: { $elemMatch: { itemId: ItemId, itemStock: { $gt: 0 } } },
        },
        { $inc: { 'itemList.$.itemStock': -1 } },
        { session }
      );
      if (stockUpdate.matchedCount === 0) {
        throw Object.assign(new Error('아이템 품절'), { status: 400 });
      }

      purchasedItemId = new ObjectId().toString();

      // 잔액이 충분할 때만 원자적으로 차감 (동시 요청에 의한 이중 지출 방지)
      const moneyUpdate = await db.collection('user_data').updateOne(
        { userId, role: 'student', money: { $gte: price } },
        {
          $push: {
            itemList: {
              itemName: item.itemName,
              itemPrice: price,
              itemId: purchasedItemId,
              emoji: item.emoji,
              itemExplanation: item.itemExplanation,
            },
          },
          $inc: { money: -price },
        },
        { session }
      );
      if (moneyUpdate.matchedCount === 0) {
        // 트랜잭션이라 여기서 throw하면 위의 재고 차감도 함께 롤백된다.
        throw Object.assign(new Error('잔액부족'), { status: 400 });
      }

      await db.collection('history').insertOne(
        {
          teacher_id: teacherObjectId,
          classId: classObjectId,
          userId,
          balance: studentData.money - price,
          type: '출금',
          amount: price,
          date: new Date(),
          expiresAfter: new Date(),
          name: item.itemName + ' 구입',
        },
        { session }
      );
    });

    return res.status(200).json({ result: true, message: 'buy 성공', itemId: purchasedItemId });
  } catch (error) {
    const status = error.status ?? 500;
    return res.status(status).json({ result: false, message: error.message || '구매 처리 중 오류가 발생했습니다.' });
  } finally {
    await session.endSession();
  }
}
