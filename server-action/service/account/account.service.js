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


export async function deleteStudentAccountService({ student, classNumber, teacher_id, classId }) {

  const classObjectId = ObjectId.createFromHexString(classId);
  const teacherObjectId = ObjectId.createFromHexString(teacher_id);
  // MongoDB 연결
  const db = (await connectDB).db('user');
  const db2 = (await connectDB).db('data')

  // ✅ teacher_id/classId로 범위를 제한해서 이 교사가 실제 담임인 학생만 지울 수 있게 한다.
  // (이전엔 userId만으로 매칭해서, 원리적으로는 다른 교사의 학생 계정도 지울 수 있었음.
  //  바로 아래 resetPwdService는 이미 이렇게 스코핑되어 있었음)
  const response = await db.collection('users').deleteOne({
    userId: student,
    teacher_id: teacherObjectId,
    classId: classObjectId,
  })
  const response2 = await db2.collection('user_data').deleteOne({
    userId: student,
    teacher_id: teacherObjectId,
    classId: classObjectId,
  })

  if (response.deletedCount === 0 && response2.deletedCount === 0) {
    throw new Error("해당 학생 계정을 찾을 수 없거나 삭제 권한이 없습니다.")
  }

  let newKey = "studentAccounts." + classNumber

  const response3 = await db2.collection('class_data').updateOne({
    teacher_id: teacherObjectId,
    classId: classObjectId
  }, { $set: { [newKey]: false } })


  return {
    result: true,
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
