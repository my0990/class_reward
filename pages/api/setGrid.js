import { connectDB } from '@/trash/lib/database'

import { buildFilter } from '@/lib/api/buildFilter';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { updatedGrid } = req.body;

    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });
    const db = (await connectDB).db('data');

    const response = await db.collection('class_data').updateOne({...scopeFilter},{$set: {gridData: updatedGrid}},{upsert: true})
    if(response){
      res.status(200).json({ result: true, message: 'grid set success' });
    } else {
      res.status(402).json({result: false})
    }

  }
}