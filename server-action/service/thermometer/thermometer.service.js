import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function updateThermometerSettingService({ teacher_id, classId, rewardObj, requireCurrency }) {


    const db = (await connectDB).db('data');
    const response = await db.collection('thermometer').updateOne({ teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId) }, { $set: { "reward": rewardObj, "requireCurrency": requireCurrency } }, { upsert: true })

    return {
        result: true,
    };

}