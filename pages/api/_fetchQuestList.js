import { connectDB } from '@/app/lib/database'
import { getToken } from 'next-auth/jwt'
import { buildFilter } from '@/lib/api/buildFilter';

export default async function handler(req, res) {


  if (req.method === 'GET') {
    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });


    const db = (await connectDB).db('data');
    const response = await db.collection('quest').find({scopeFilter},{projection: {code: 0}}).sort({time:'-1'}).toArray();



    res.status(200).json(response);
  }
}



