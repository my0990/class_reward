import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
import {getToken} from "next-auth/jwt"
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;


    const {itemData, userId, balance} = req.body;
    // MongoDB 연결
    // const itemData = req.body.itemData;
    // const balance = req.body.balance
    const db = (await connectDB).db('data');
    let itemId = (new ObjectId()).toString();
    const ItemId = itemData.itemId;


    const response = await db.collection('class_data').updateOne({code: code, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemStock': -1}})
    const response2 = await db.collection('user_data').updateOne({userId: userId, role:"student"},{$push: {itemList: {itemName: itemData.itemName, itemPrice: itemData.itemPrice, itemId: itemId,  emoji: itemData.emoji, itemExplanation: itemData.itemExplanation}}, $inc: {money: -itemData.itemPrice}}, {upsert: true})
    // const response3 = await db.collection('user_data').updateOne({userId: userId},{$inc: {money: -itemData.itemPrice}})
    const response4 = await db.collection('history').insertOne({userId: userId,balance: balance, type: 'withDrawal', amount: itemData.itemPrice, date: new Date(),expiresAfter: new Date(), name: itemData.itemName + ' 구입'})
    res.status(200).json({ result: true, message: 'buy 성공', itemId: itemId });
}}