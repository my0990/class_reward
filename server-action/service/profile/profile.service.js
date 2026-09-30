import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";
export async function createProfileImgService({ teacher_id, classId, url }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);
    const itemId = new ObjectId()
    const newKey = "profileImgStorage." + itemId
    const db = (await connectDB).db('data');


    const response = await db.collection('class_data').updateOne({ teacher_id: teacherObjectId, classId: classObjectId }, { $set: { [newKey]: { url: url, price: 99999 } } }, { upsert: true })



    return {
        result: true,
    };
}

export async function updateProfileImgService({ teacher_id, classId, price, url, urlId }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);

    const modifyKey = "profileImgStorage." + urlId
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');

    const updatedData = { price: price, url: url }
    const response = await db.collection('class_data').updateOne({ teacher_id: teacherObjectId, classId: classObjectId }, { $set: { [modifyKey]: updatedData } }, { upsert: true })

    return {
        result: true,
    };
}

export async function deleteProfileImgService({ teacher_id, classId, urlId }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);

    const db = (await connectDB).db('data');
    const deleteKey = "profileImgStorage." + urlId

    const response = await db.collection('class_data').updateOne(
        { teacher_id: teacherObjectId, classId: classObjectId },
        { $unset: { [deleteKey]: "" } }
    );
    return {
        result: true,
    };
}

/**
 * 학생 프로필 이미지 구매
 * - 가격/이미지 주소는 클라이언트 값이 아니라 학급의 profileImgStorage에서 서버가 읽는다.
 * - 이미 가진 이미지는 다시 살 수 없고, 잔액이 부족하면 구매되지 않는다.
 * - 트랜잭션 + 조건부 차감이라 동시에 여러 번 눌러도 한 번만 결제된다.
 * - history.balance는 서버가 계산한 구매 후 잔액이다.
 */
export async function buyProfileImgService({ teacher_id, classId, userId, urlId }) {
    if (!userId) {
        throw new Error("잘못된 요청입니다.");
    }

    // urlId는 DB 필드 경로("profileImgStorage.<urlId>")에 들어가므로
    // ObjectId 형식(24자리 hex)만 허용해서 "a.b", "$x" 같은 경로 조작을 막는다.
    if (typeof urlId !== "string" || !/^[0-9a-f]{24}$/i.test(urlId)) {
        throw new Error("잘못된 프로필 이미지입니다.");
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
    const studentFilter = { ...scope, userId, role: "student" };
    const keyName = "profileImgStorage." + urlId;

    const client = await connectDB;
    const db = client.db("data");
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            const classData = await db.collection("class_data").findOne(scope, { session });
            const product = classData?.profileImgStorage?.[urlId];
            if (!product?.url) {
                throw new Error("존재하지 않는 프로필 이미지입니다.");
            }

            const price = toNonNegativeInt(product.price);
            if (price === null) {
                throw new Error("프로필 이미지 가격 정보가 올바르지 않습니다. 선생님께 문의해 주세요.");
            }

            const student = await db.collection("user_data").findOne(studentFilter, { session });
            if (!student) {
                throw new Error("사용자 정보를 찾을 수 없습니다.");
            }
            if (student.profileImgStorage?.[urlId]) {
                throw new Error("이미 구입한 프로필 이미지입니다.");
            }
            if (student.money < price) {
                throw new Error("잔액이 부족합니다.");
            }

            // 잔액이 충분하고 아직 안 가진 경우에만 원자적으로 처리 (upsert 금지)
            const update = await db.collection("user_data").updateOne(
                { ...studentFilter, money: { $gte: price }, [keyName]: { $exists: false } },
                { $set: { [keyName]: product.url }, $inc: { money: -price } },
                { session }
            );
            if (update.matchedCount === 0) {
                throw new Error("잔액이 부족하거나 이미 구입한 프로필 이미지입니다.");
            }

            await db.collection("history").insertOne(
                {
                    ...scope,
                    userId,
                    balance: student.money - price,
                    type: "출금",
                    amount: price,
                    date: new Date(),
                    expiresAfter: new Date(),
                    name: "프로필 구입",
                },
                { session }
            );
        });
    } finally {
        await session.endSession();
    }

    return {
        result: true,
    };
}



export async function selectProfileImgService({ teacher_id, classId, url, userId }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);

    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne({ classId: classObjectId, teacher_id: teacherObjectId, userId: userId }, { $set: { "profileUrl": url } }) 
    
    return {
        result: true,
    };
}

export async function selectProfileTitleService({ teacher_id, classId, profileTitle, userId }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);

    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne({ classId: classObjectId, teacher_id: teacherObjectId, userId: userId }, { $set: { "profileTitle": profileTitle } }) 
    
    return {
        result: true,
    };
}


