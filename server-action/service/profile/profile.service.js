import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";
const HEX24 = /^[0-9a-f]{24}$/i;

function toScope({ teacher_id, classId }) {
    try {
        return {
            teacher_id: ObjectId.createFromHexString(teacher_id),
            classId: ObjectId.createFromHexString(classId),
        };
    } catch {
        throw new Error("잘못된 학급 정보입니다.");
    }
}

// urlId는 DB 필드 경로("profileImgStorage.<urlId>")에 들어가므로 ObjectId 형식만 허용한다.
function assertUrlId(urlId) {
    if (typeof urlId !== "string" || !HEX24.test(urlId)) {
        throw new Error("잘못된 프로필 이미지입니다.");
    }
}

// 이미지 주소는 http(s) 주소만 허용 (javascript: 같은 값 차단)
function normalizeImageUrl(url) {
    const value = String(url ?? "").trim();
    if (!/^https?:\/\/\S+$/i.test(value) || value.length > 2000) {
        throw new Error("이미지 주소는 http:// 또는 https://로 시작해야 합니다.");
    }
    return value;
}

// 새 이미지는 교사가 가격을 정할 때까지 사실상 살 수 없도록 99999로 등록한다 (기존 동작 유지).
export const DEFAULT_PROFILE_IMG_PRICE = 99999;

export async function createProfileImgService({ teacher_id, classId, url }) {
    const scope = toScope({ teacher_id, classId });
    const imageUrl = normalizeImageUrl(url);
    const itemId = new ObjectId().toHexString();
    const db = (await connectDB).db('data');

    // upsert 금지: 학급 문서가 없으면 잘못된 요청이다.
    const response = await db.collection('class_data').updateOne(
        scope,
        { $set: { ["profileImgStorage." + itemId]: { url: imageUrl, price: DEFAULT_PROFILE_IMG_PRICE } } }
    );
    if (response.matchedCount === 0) {
        throw new Error("학급 정보를 찾을 수 없습니다.");
    }

    return {
        result: true,
        urlId: itemId,
    };
}

export async function updateProfileImgService({ teacher_id, classId, price, url, urlId }) {
    const scope = toScope({ teacher_id, classId });
    assertUrlId(urlId);

    // 화면 입력값은 문자열("100")로 오므로 정수로 저장한다. 문자열로 저장되면 구매가 깨진다.
    const numericPrice = toNonNegativeInt(price);
    if (numericPrice === null) {
        throw new Error("가격은 0 이상의 정수로 입력해주세요.");
    }

    const key = "profileImgStorage." + urlId;
    const db = (await connectDB).db('data');

    const classData = await db.collection('class_data').findOne(
        { ...scope, [key]: { $exists: true } },
        { projection: { [key]: 1 } }
    );
    const current = classData?.profileImgStorage?.[urlId];
    if (!current) {
        throw new Error("프로필 이미지를 찾을 수 없습니다.");
    }

    // 주소는 바뀐 경우에만 검사해서 저장한다 (예전에 등록된 주소는 그대로 둔다).
    const update = { [key + ".price"]: numericPrice };
    if (url !== undefined && url !== current.url) {
        update[key + ".url"] = normalizeImageUrl(url);
    }

    await db.collection('class_data').updateOne({ ...scope, [key]: { $exists: true } }, { $set: update });

    return {
        result: true,
    };
}

export async function deleteProfileImgService({ teacher_id, classId, urlId }) {
    const scope = toScope({ teacher_id, classId });
    assertUrlId(urlId);

    const db = (await connectDB).db('data');
    const key = "profileImgStorage." + urlId;

    const response = await db.collection('class_data').updateOne(
        { ...scope, [key]: { $exists: true } },
        { $unset: { [key]: "" } }
    );
    if (response.matchedCount === 0) {
        throw new Error("프로필 이미지를 찾을 수 없습니다.");
    }

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



/** 학생이 가진(구입한) 이미지 중에서만 프로필 사진으로 고를 수 있다. */
export async function selectProfileImgService({ teacher_id, classId, url, userId }) {
    const scope = toScope({ teacher_id, classId });
    if (!userId || typeof url !== "string" || !url) {
        throw new Error("잘못된 요청입니다.");
    }

    const db = (await connectDB).db('data');
    const studentFilter = { ...scope, userId, role: "student" };
    const student = await db.collection('user_data').findOne(studentFilter, { projection: { profileImgStorage: 1 } });
    if (!student) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const owned = Object.values(student.profileImgStorage ?? {}).includes(url);
    if (!owned) {
        throw new Error("구입한 프로필 이미지만 선택할 수 있습니다.");
    }

    await db.collection('user_data').updateOne(studentFilter, { $set: { profileUrl: url } });

    return {
        result: true,
    };
}

/** 학생이 받은 칭호(titles) 중에서만 고를 수 있다. */
export async function selectProfileTitleService({ teacher_id, classId, profileTitle, userId }) {
    const scope = toScope({ teacher_id, classId });
    if (!userId || typeof profileTitle !== "string" || !profileTitle) {
        throw new Error("잘못된 요청입니다.");
    }

    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne(
        { ...scope, userId, role: "student", "titles.title": profileTitle },
        { $set: { profileTitle } }
    );
    if (response.matchedCount === 0) {
        throw new Error("받은 칭호만 선택할 수 있습니다.");
    }

    return {
        result: true,
    };
}
