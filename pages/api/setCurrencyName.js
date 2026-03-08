import { connectDB } from '@/lib/mongodb';

import { buildFilter } from '@/lib/api/buildFilter';
export default async function handler(req, res) {

  const scopeFilter = await buildFilter(req, res, { classIdRequired: true });
  if (req.method === 'POST') {


    const {currencyName, currencyEmoji} = req.body.data

    console.log(scopeFilter)
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');
    const response = await db.collection('class_data').updateOne(scopeFilter,{$set: {currencyName: currencyName, currencyEmoji: currencyEmoji}},{upsert: true})
    // const respojnse2 = await db.collection('user_data').updateMany({teacher:userId},{$set: {classData: req.body.data}},{upsert: false})

    // console.log(response2)
    res.status(201).json({ result: true, message: '화폐 입력 성공' });
  }
}