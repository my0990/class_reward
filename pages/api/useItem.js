import { connectDB } from '@/app/lib/database'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const db = (await connectDB).db('data');
    const {itemName, userId, itemId, teacher, userName, itemPrice} = req.body;
    console.log(req.body)
    // const response = await db.collection('student').updateOne({userId:req.body.userId},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    // const response = await db.collection('user_data').updateOne({ userId: userId,"itemList.itemId": itemId},{$set : {'itemList.$.state': '대기중'}})
    const response = await db.collection('user_data').updateOne({ userId: userId},{$pull : {itemList: {itemId: itemId}}})
    const response2 = await db.collection('user_data').updateOne({userId:teacher},{$push: {"notification": {itemId: itemId, userId: userId, itemName: itemName, state: '대기중', userName: userName, itemPrice: itemPrice}}},{upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId:teacher},{$inc: {"notificationCount": 1}}, {upsert: true})
    const response4 = await db.collection('user_data').findOne({userId: userId})
    const response5 = await db.collection('history').insertOne({userId: userId, balance: response4.money, type: 'withDrawal', amount: 0, date: new Date(), name: '아이템 사용 (' + itemName + ')', expiresAfter: new Date() })


    res.status(201).json({ result: true, message: 'useItem 성공' });
}}