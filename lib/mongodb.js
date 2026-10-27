import { MongoClient } from 'mongodb'

// DB 연결 (모든 서버 코드가 `await connectDB`로 쓴다)
//
// - 서버(Vercel 함수) 하나가 여는 연결 수 제한: 접속자가 늘어 서버가 여러 개 떠도
//   Atlas 무료(M0) 연결 한도 500개를 넘지 않게. 쓰지 않는 연결은 1분 뒤 닫는다.
// - 연결에 실패하면 그 실패를 기억하지 않고 다음 요청 때 다시 연결한다.
//   (예전에는 서버가 켜질 때 한 번 만든 연결 결과를 계속 써서, 그 한 번이 실패하면
//    그 서버가 꺼질 때까지 모든 요청이 같은 실패를 돌려받았다)
// - DB를 못 찾으면 30초(기본값) 대신 8초만 기다린다 → 화면이 오래 멈춰 있지 않고 빨리 '다시 시도' 안내
// - 처음 쓸 때 연결한다 (파일을 읽기만 해서는 연결하지 않음 → DB 주소 없는 테스트도 안전)
const options = {
  maxPoolSize: 10,
  maxIdleTimeMS: 60_000,
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 10_000,
  appName: 'kkyul',
}

// 개발 중에는 코드가 바뀔 때마다 파일이 다시 읽혀도 연결을 하나만 쓰게 global에 둔다
const store = process.env.NODE_ENV === 'development' ? (global._kkyulMongo ??= {}) : {}

function getClient() {
  if (!store.promise) {
    store.promise = new MongoClient(process.env.MONGODB_URI, options).connect().catch((err) => {
      store.promise = null // 실패는 기억하지 않는다 → 다음 요청 때 다시 연결
      throw err
    })
  }
  return store.promise
}

// `await connectDB`가 그대로 동작하는 객체 (부를 때마다 연결 상태를 확인)
const connectDB = {
  then(onFulfilled, onRejected) {
    return getClient().then(onFulfilled, onRejected)
  },
  catch(onRejected) {
    return getClient().catch(onRejected)
  },
}

export { connectDB }
