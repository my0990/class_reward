import InventoryTemplate from './components/inventoryTemplate';
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
    () => import('./components/inventoryTemplate'), // dynamic import 할 컴포넌트를 불러오고,
    { ssr: false } // SSR 옵션을 false로 설정해준다.
  )
export default async function Inventory(){
    // let data = [{ name: '자리바꾸기', price: 50001 }, { name: '급식 1등으로 가기', price: 300 }, { name: '사탕 1개', price: 30 }]
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    console.log(session)
    const db = (await connectDB).db('data')
    const data = await db.collection('user_data').findOne({userId: userId})
    console.log(data.userName)
    return(
        <DynamicComponentWithNoSSR  data={data?.itemList} userId={userId} teacher={teacher} userName={data.userName} userMoney={data.money}/>
    )
}