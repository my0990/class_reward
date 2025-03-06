import { connectDB } from '@/app/lib/database'

export default async function handler(req, res) {


  if (req.method === 'POST') {


    const {pickedData, userId, balance} = req.body;
    // console.log(req.body)

    
    const {price, url, urlId} = pickedData;

    // MongoDB 연결
    const db = (await connectDB).db('data');


    let keyName = "profileImgStorage." + urlId 

    // const response = await db.collection('user_data').updateOne({userId: teacherId, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemQuantity': -1}}),
    const response2 = await db.collection('user_data').updateOne({userId: userId, role: "student"}, {$set: {[keyName]: url}, $inc: {money: -parseInt(price)}}, {upsert: true})
    const response4 = await db.collection('history').insertOne({userId: userId, balance: balance, type: 'withDrawal', amount: price, date: new Date(),expiresAfter: new Date(), name: '프로필 구입'})
    res.status(200).json({ result: true, message: 'profile buy 성공'});
}}