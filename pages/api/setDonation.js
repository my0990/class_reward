import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {


    if (req.method === 'POST') {
        const db = (await connectDB).db('data');
        const { userId, amount, teacher, money } = req.body;
        const response = await db.collection('user_data').updateOne(
            { userId: userId },
            {
                $inc: {
                    money: -amount
                }
            }
        )
        const response2 = await db.collection('thermometer').updateOne(
            { userId: teacher },
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
        res.status(201).json({ result: true, message: 'donation updated' });
    }
}