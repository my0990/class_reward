import { connectDB } from '@/trash/lib/database'
import { ObjectId } from 'mongodb';
import { buildFilter } from '@/lib/api/buildFilter';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // MongoDB 연결
    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });
    let questId = ObjectId.createFromHexString(req.body.data._id)
    const db = (await connectDB).db('data');
    const response = await db.collection('quest').deleteOne(
      { _id : questId },
  );
    res.status(201).json({ result: true, message: 'delete 성공' });
}}