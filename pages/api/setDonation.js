import { connectDB } from '@/app/lib/database'
import {getToken} from "next-auth/jwt"
export default async function handler(req, res) {


    if (req.method === 'POST') {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const code = token.code;

        const db = (await connectDB).db('data');
        const { userId, amount,  money } = req.body;
        const response = await db.collection('user_data').updateOne(
            { userId: userId },
            {
                $inc: {
                    money: -amount
                }
            }
        )
        const response2 = await db.collection('thermometer').updateOne(
            { code: code },
            {
                $inc: {
                    [`donators.${userId}`]: amount
                }
            })

        const response3 = await db.collection('history').insertOne(
            {
                userId: userId,
                balance: money - amount,
                type: 'withDrawal',
                amount: amount,
                date: new Date(),
                expiresAfter: new Date(),
                name: "기부"
            }
        )
        res.status(200).json({ result: true, message: 'donation updated' });
    }
}