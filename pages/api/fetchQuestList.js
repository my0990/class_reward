import { connectDB } from '@/app/lib/database'
import { getToken } from 'next-auth/jwt'


export default async function handler(req, res) {


  if (req.method === 'GET') {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;


    const db = (await connectDB).db('data');
    const response = await db.collection('quest').find({code: code},{projection: {code: 0}}).sort({time:'-1'}).toArray();



    res.status(200).json(response);
  }
}



