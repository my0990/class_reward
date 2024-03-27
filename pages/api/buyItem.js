import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {id,role,teacher} = session.user;
    console.log(teacher)
    // MongoDB 연결
    const buyId = req.body.id
    console.log(req.body)
    const db = (await connectDB).db('data');
    let itemId = (new ObjectId()).toString();
    // const response = await db.collection(id).updateOne(
    //   { name : 'item', [itemList.id]: buyId },
    //   { $set : { "itemList": { "id": buyId} } }
//   );
    // const response = await db.collection(id).updateOne({"itemList.id": buyId},{$inc : {"itemList.quantity": -1}})
    const response = await db.collection('teacher').updateOne({user: teacher, "itemList.id": buyId},{$inc : {'itemList.$.quantity': -1}})
    const response2 = await db.collection('student').updateOne({user: id},{$push: {itemList: {name: req.body.name, price: req.body.price, state: '사용 가능', itemId: itemId, teacher: teacher}}}, {upsert: true})
    res.status(201).json({ result: true, message: 'delete 성공' });
}}