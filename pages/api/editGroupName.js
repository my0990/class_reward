import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    console.log(req.body)
    const { groupKey, updatedGroupName } = req.body;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    // MongoDB 연결

    

    const db = (await connectDB).db('data');
    const keyToUpdate = "groupData." + groupKey + ".groupName"
    console.log(keyToUpdate)
    const response = await db.collection('class_data').updateOne({ code: code},{$set: { [keyToUpdate]: updatedGroupName} }, { upsert: true })


    if(response){
      res.status(200).json({ result: true, message: 'groupName 변경 성공' });
    } else {
      res.status(402).json({result: false})
    }

  }
}