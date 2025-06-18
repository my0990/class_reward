import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
import { getToken } from 'next-auth/jwt'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    const { groupName } = req.body;
    // MongoDB 연결
    let groupId = new ObjectId().toString();
    const db = (await connectDB).db('data');
    const newKey = "groupData." + groupId

    // const response = await db.collection('class_data').updateOne({code:code},{$push: {"groupData": {groupId: groupId, groupName: groupName, groupColor: "bg-orange-500", groupMember: []}}},{upsert: true})
    const response = await db.collection('class_data').updateOne({ code: code }, { $set: { [newKey]: { groupName: groupName, groupColor: "bg-orange-500", groupMember: [] } } }, { upsert: true })



    res.status(200).json({ result: true, message: 'dd', groupId: groupId });
  }
}