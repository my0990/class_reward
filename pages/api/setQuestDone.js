import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    console.log(req.body);
    const db = (await connectDB).db('data');
    const questId =  ObjectId.createFromHexString(req.body.id);
    const response2 = await db.collection('quest').findOne({'_id': questId})
    console.log('------')
    console.log(response2)
    console.log(response2)
    console.log(response2)
    const checkedStudent = "done." + req.body.name;
    // const response = await db.collection('quest').updateOne({_id: req.body.id},{$bit: {"done.이명권":{xor: 1}}})
    const response = await db.collection('quest').updateOne({_id: questId},[{$set:{[checkedStudent]:{$eq: [false,`$${checkedStudent}`]}}}])
    console.log(response)
    res.status(201).json({ result: true, message: 'profile 변경 성공' });
  }}