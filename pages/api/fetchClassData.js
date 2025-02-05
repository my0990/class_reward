import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'


export default async function handler(req, res) {

  if (req.method === 'GET') {
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;


    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const db = (await connectDB).db('data')
    const response = await db.collection('class_data').findOne({ code:  code},{projection: {code: 0}})

    if(response){
        res.status(200).json(response);
    } else {
        res.status(500).json({result: false, message: 'error'})
    }

  }
}
