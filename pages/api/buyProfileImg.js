import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    const {urlData,urlId} = req.body.data;
    const {price, url} = urlData;
    // MongoDB 연결
    const db = (await connectDB).db('data');

    const response = await db.collection('user_data').findOne({userId: userId});
    if(response.money < price){
        console.log('tttt')
        res.status(400).json({
            result: false, 
            error: "balance not enough",
            message: '잔액 부족'})
        return
    }

    const balance = parseInt(response.money) - parseInt(price)
    let keyName = "profileUrlObj." + urlId 
    // const response = await db.collection('user_data').updateOne({userId: teacherId, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemQuantity': -1}})
    const response2 = await db.collection('user_data').updateOne({userId: userId},{$set: {[keyName]:url}}, {upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId: userId},{$inc: {money: -parseInt(price)}}, {upsert: true})
    const response4 = await db.collection('history').insertOne({userId: userId,balance: balance, type: 'withDrawal', amount: price, date: new Date(),expiresAfter: new Date(), name: '프로필 ['+ urlId + '] 구입'})
    res.status(201).json({ result: true, message: 'profile buy 성공'});
}}