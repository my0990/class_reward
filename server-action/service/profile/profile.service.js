import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
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

export async function buyProfileImgService({ teacher_id, classId, pickedData, userId, balance }) {

    const classObjectId = ObjectId.createFromHexString(classId);
    const teacherObjectId = ObjectId.createFromHexString(teacher_id);
    const db = (await connectDB).db('data');

    // console.log(req.body)


    const { price, url, urlId } = pickedData;



    let keyName = "profileImgStorage." + urlId
    // const response = await db.collection('user_data').updateOne({userId: teacherId, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemQuantity': -1}}),
    const response2 = await db.collection('user_data').updateOne({ userId: userId, classId: classObjectId, teacher_id: teacherObjectId, role: "student" }, { $set: { [keyName]: url }, $inc: { money: -parseInt(price) } }, { upsert: true })
    const response4 = await db.collection('history').insertOne({ teacher_id: teacherObjectId, classId: classObjectId, userId: userId, balance: balance, type: 'withDrawal', amount: price, date: new Date(), expiresAfter: new Date(), name: '프로필 구입' })
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


