import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { hash } from 'bcryptjs';

export const MAX_CLASS_NUMBER = 40;
export const DEFAULT_STUDENT_PASSWORD = "12345678";

/**
 * 학생 계정 생성
 * - 아이디 = 학급 고유 별명(서버가 DB에서 읽음) + 번호. 화면에서 보낸 별명은 쓰지 않는다.
 * - 번호는 1~40 정수만, 중복 제거.
 * - 이미 만든 번호는 다시 만들지 않는다: 트랜잭션 안에서 class_data.studentAccounts.<번호>를
 *   "생성됨"으로 먼저 '찜'한 번호만 만든다. 버튼을 두 번 누르거나 동시에 요청해도 계정이 두 개 생기지 않는다.
 * - 같은 아이디가 (다른 학급 등) 이미 있으면 그 번호는 건너뛴다.
 * @returns {{ result: true, created: number[], skipped: number[] }}
 */
export async function createStudentAccountService({ teacher_id, classId, accountArr }) {
  const nicknameData = {
    "determiners": ["예쁜", "화난", "귀여운", "배고픈", "슬픈", "푸른", "비싼", "밝은", "부유한", "귀여운", "화난", "똑똑한", "게으른", "배부른", "신난", "천재적인", "순수한"
    ],

    "animals": ["호랑이", "비버", "강아지", "부엉이", "여우", "치타", "문어", "고양이", "미어캣", "다람쥐", "치와와", "비글", "오징어", "하마", "기린", "판다", "토끼", "돌고래",
    ]
  }


  const randomUrlArr = [
    'https://cdn.pixabay.com/photo/2014/03/25/15/23/tangerine-296654_1280.png',
    'https://cdn.pixabay.com/photo/2022/11/01/19/52/tangerine-7563214_1280.png',
    'https://cdn.pixabay.com/photo/2021/06/05/22/19/orange-6313871_1280.png',
    'https://cdn.pixabay.com/photo/2013/07/12/16/59/tangerine-151616_1280.png',
    'https://cdn.pixabay.com/photo/2022/08/25/21/25/mandarin-7411336_1280.png',
    'https://images.unsplash.com/photo-1632055214451-559fde197458?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://cdn.pixabay.com/photo/2014/04/03/11/57/fruit-312671_1280.png',
    'https://cdn.pixabay.com/photo/2021/06/04/01/12/orange-6308395_1280.png'
  ]


  const numbers = [...new Set((Array.isArray(accountArr) ? accountArr : []).map(Number))];
  if (numbers.length === 0) {
    throw new Error("생성할 계정을 선택해주세요.");
  }
  if (numbers.some((n) => !Number.isInteger(n) || n < 1 || n > MAX_CLASS_NUMBER)) {
    throw new Error(`번호는 1~${MAX_CLASS_NUMBER} 사이여야 합니다.`);
  }

  let scope;
  try {
    scope = {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId),
    };
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");

  const classData = await data.collection("class_data").findOne(scope, { projection: { uniqueNickname: 1 } });
  if (!classData) {
    throw new Error("학급 정보를 찾을 수 없습니다.");
  }
  const nickname = classData.uniqueNickname;
  if (typeof nickname !== "string" || !nickname) {
    throw new Error("먼저 학급 고유 별명을 등록해주세요.");
  }

  // 비밀번호 해시는 느리므로(약 0.2초) 트랜잭션 밖에서 한 번만 만든다.
  const passwordHash = await hash(DEFAULT_STUDENT_PASSWORD, 12);

  const created = [];
  const skipped = [];
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      created.length = 0;
      skipped.length = 0;

      // 같은 아이디가 이미 있는 번호는 건너뛴다 (다른 학급과 아이디가 겹치는 경우 포함)
      const ids = numbers.map((n) => nickname + n);
      const [existingUsers, existingData] = await Promise.all([
        userDb.collection("users").find({ userId: { $in: ids } }, { session, projection: { userId: 1 } }).toArray(),
        data.collection("user_data").find({ userId: { $in: ids } }, { session, projection: { userId: 1 } }).toArray(),
      ]);
      const taken = new Set([...existingUsers, ...existingData].map((u) => u.userId));

      for (const n of numbers) {
        if (taken.has(nickname + n)) {
          skipped.push(n);
          continue;
        }
        // 이 번호를 '찜'한다. 이미 "생성됨"이면 다른 요청이 먼저 만든 것이므로 건너뛴다.
        const claim = await data.collection("class_data").updateOne(
          { ...scope, [`studentAccounts.${n}`]: { $ne: "생성됨" } },
          { $set: { [`studentAccounts.${n}`]: "생성됨" } },
          { session }
        );
        if (claim.modifiedCount === 1) created.push(n);
        else skipped.push(n);
      }

      if (created.length === 0) return;

      await data.collection("user_data").insertMany(
        created.map((n) => ({
          userId: nickname + n,
          money: 0,
          profileNickname:
            nicknameData.determiners[Math.floor(Math.random() * nicknameData.determiners.length)] +
            " " +
            nicknameData.animals[Math.floor(Math.random() * nicknameData.animals.length)],
          profileState: "",
          ...scope,
          classNumber: n,
          profileUrl: randomUrlArr[Math.floor(Math.random() * randomUrlArr.length)],
          profileImgStorage: {},
          profileTitle: "초보 오렌지",
          inventory: [],
          role: "student",
          exp: 0,
          titles: [],
          itemList: [],
        })),
        { session }
      );

      await userDb.collection("users").insertMany(
        created.map((n) => ({
          userId: nickname + n,
          passwordHash,
          role: "student",
          ...scope,
        })),
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  created.sort((a, b) => a - b);
  skipped.sort((a, b) => a - b);
  return { result: true, created, skipped };
}


/**
 * 학생 계정 삭제
 * 같은 번호로 새 계정을 만들면 아이디가 같아지므로, 이 학생 아이디로 남은 기록도 함께 지운다.
 * (지우지 않으면 이전 학생의 거래 기록·기부·퀘스트 완료가 새 학생에게 보인다)
 * - 로그인 계정(users), 학생 데이터(user_data), 거래 기록(history), 키오스크 비밀번호 시도 기록
 * - 온도계 기부자 목록(donators.<아이디>)에서 제외. 학급 온도(manualDegree)는 학급 전체 결과라 그대로 둔다.
 * - 퀘스트 완료/대기 목록에서 제외
 * - class_data.studentAccounts.<번호>를 false로 (다시 만들 수 있게)
 * 모두 하나의 트랜잭션으로 처리한다. 번호는 화면 값이 아니라 DB의 classNumber를 쓴다.
 */
export async function deleteStudentAccountService({ student, teacher_id, classId }) {
  if (!student || typeof student !== "string") {
    throw new Error("삭제할 학생 정보가 올바르지 않습니다.");
  }

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
    classObjectId = ObjectId.createFromHexString(classId);
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const scope = { teacher_id: teacherObjectId, classId: classObjectId };
  const userId = student;

  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");
  const session = client.startSession();

  let removed = null;

  try {
    await session.withTransaction(async () => {
      const studentData = await data.collection("user_data").findOne(
        { ...scope, userId, role: "student" },
        { session, projection: { classNumber: 1 } }
      );
      const login = await userDb.collection("users").findOne(
        { ...scope, userId, role: "student" },
        { session, projection: { _id: 1 } }
      );
      if (!studentData && !login) {
        throw new Error("해당 학생 계정을 찾을 수 없거나 삭제 권한이 없습니다.");
      }

      await userDb.collection("users").deleteOne({ ...scope, userId, role: "student" }, { session });
      await data.collection("user_data").deleteOne({ ...scope, userId, role: "student" }, { session });

      // 거래 기록: 예전 기록은 교사·학급 id가 문자열이거나 없는 경우가 있어서 함께 지운다.
      const history = await data.collection("history").deleteMany(
        {
          userId,
          $or: [
            { teacher_id: teacherObjectId },
            { teacher_id: teacher_id },
            { teacher_id: { $exists: false } },
          ],
        },
        { session }
      );

      // 아이디가 DB 필드 경로로 쓰이므로 "."이나 "$"가 들어간 (예전) 아이디는 건너뛴다.
      const thermometer = /^[^.$]+$/.test(userId)
        ? await data.collection("thermometer").updateMany(
            { ...scope, [`donators.${userId}`]: { $exists: true } },
            { $unset: { [`donators.${userId}`]: "" } },
            { session }
          )
        : { modifiedCount: 0 };

      const quests = await data.collection("quest").updateMany(
        { ...scope, $or: [{ finished: userId }, { pending: userId }] },
        { $pull: { finished: userId, pending: userId } },
        { session }
      );

      await userDb.collection("kiosk_pwd_attempts").deleteMany({ teacher_id: teacherObjectId, userId }, { session });

      const classNumber = studentData?.classNumber;
      if (Number.isInteger(classNumber)) {
        await data.collection("class_data").updateOne(
          scope,
          { $set: { [`studentAccounts.${classNumber}`]: false } },
          { session }
        );
      }

      removed = {
        history: history.deletedCount,
        thermometer: thermometer.modifiedCount,
        quests: quests.modifiedCount,
      };
    });
  } finally {
    await session.endSession();
  }

  return {
    result: true,
    removed,
  };
}



export async function resetPwdService({ student, teacher_id, classId }) {


  // MongoDB 연결

  const classObjectId = ObjectId.createFromHexString(classId);
  const teacherObjectId = ObjectId.createFromHexString(teacher_id);

  // MongoDB 연결

  const db = (await connectDB).db('user');
  const password = await hash(DEFAULT_STUDENT_PASSWORD, 12);

  const response = await db.collection('users').updateOne({
    userId: student,
    teacher_id: teacherObjectId,
    classId: classObjectId
  }, { $set: { "passwordHash": password }, $unset: { password: "" } })

  if (response.matchedCount === 0) {
    throw new Error("해당 학생 계정을 찾을 수 없거나 권한이 없습니다.");
  }

  return {
    result: true,
  };
}

// 학급 고유 별명 = 학생 아이디 앞부분. 숫자가 들어가면 "반1"+"2"와 "반"+"12"처럼 아이디가 겹칠 수 있어서 금지한다.
export const NICKNAME_RULE = /^[A-Za-z가-힣]{2,10}$/;

export async function checkUniqueNicknameService({ teacher_id, classId, uniqueNickname }) {
  const nickname = String(uniqueNickname ?? "").trim();

  if (!nickname) {
    throw new Error("별명을 입력해주세요.");
  }
  if (!NICKNAME_RULE.test(nickname)) {
    throw new Error("별명은 한글 또는 영문 2~10자로 입력해주세요. (숫자·띄어쓰기·특수문자 불가)");
  }

  let scope;
  try {
    scope = {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId),
    };
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const db = (await connectDB).db("data");

  const checkExisting = await db.collection("class_data").findOne({ uniqueNickname: nickname }, { projection: { _id: 1 } });
  if (checkExisting) {
    throw new Error("이미 가입된 계정이에요!");
  }

  // 한 번 정한 별명은 바꿀 수 없다 (이미 만든 학생 아이디와 어긋나므로). upsert 금지.
  const res = await db.collection("class_data").updateOne(
    { ...scope, $or: [{ uniqueNickname: null }, { uniqueNickname: { $exists: false } }, { uniqueNickname: "" }] },
    { $set: { uniqueNickname: nickname } }
  );
  if (res.matchedCount === 0) {
    const exists = await db.collection("class_data").countDocuments(scope, { limit: 1 });
    throw new Error(exists ? "이미 고유 별명이 등록된 학급입니다." : "학급 정보를 찾을 수 없습니다.");
  }

  return { result: true, message: '닉네임 등록 성공' };
}
