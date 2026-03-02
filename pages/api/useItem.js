import { connectDB } from '@/app/lib/database'
import { buildFilter } from '@/lib/api/buildFilter';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const db = (await connectDB).db('data');
    const {itemName, userId, itemId, balance} = req.body;
    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });
    const response2 =  await db.collection('user_data').findOne({userId: userId, role: 'student'});
    const item = response2.itemList.find(item => item.itemId === itemId);
    if(!item){
      res.status(400).json({result: false, message: '아이템이 존재하지 않음'});
      return
    }
    const {money} = response2

    // const response = await db.collection('student').updateOne({userId:req.body.userId},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    // const response = await db.collection('user_data').updateOne({ userId: userId,"itemList.itemId": itemId},{$set : {'itemList.$.state': '대기중'}})
    const response = await db.collection('user_data').updateOne({ userId: userId, role: 'student'},{$pull : {itemList: {itemId: itemId}}})
    const response5 = await db.collection('history').insertOne({...scopeFilter, userId: userId, balance: money, type: '출금', amount: 0, date: new Date(), name: '아이템 사용 (' + itemName + ')', expiresAfter: new Date() })


    res.status(200).json({ result: true, message: 'useItem 성공' });
}}