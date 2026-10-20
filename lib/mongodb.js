import { MongoClient } from 'mongodb'
const url = process.env.MONGODB_URI
// 서버(Vercel 함수) 하나가 여는 연결 수 제한: 접속자가 늘어 서버가 여러 개 떠도
// Atlas 무료(M0) 연결 한도 500개를 넘지 않게. 쓰지 않는 연결은 1분 뒤 닫는다.
const options = { maxPoolSize: 10, maxIdleTimeMS: 60_000 }
let connectDB

if (process.env.NODE_ENV === 'development') {
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect()
  }
  connectDB = global._mongo
} else {
  connectDB = new MongoClient(url, options).connect()
}

export { connectDB }