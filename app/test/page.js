import { connectDB } from "@/app/lib/database"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
export default async function Test() {



    const session = await getServerSession(authOptions);
    const {userId} = session.user;
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: userId})
    const response2 = await db.collection('user_data').find({teacher: userId}).toArray()
    const tmp = response2.map((a) => { a._id = a._id.toString(); return a })
    response._id = response._id.toString();
    
    let data = [
        {
            name: '선생님이 줌',
            amount: 300,
            type: 'in',
            date: '2024/7/19'
        },
        {
            name: '아이템 구입',
            amount: 300,
            type: 'out',
            date: '2024/7/20'
        },
        {
            name: '선생님이 줌',
            amount: 300,
            type: 'in',
            date: '2024/7/22'
        },
        {
            name: '퀘스트 보상',
            amount: 1000,
            type: 'in',
            date: '2024/7/24'
        },
        {
            name: '선생님이 줌',
            amount: 300,
            type: 'in',
            date: '2024/7/25'
        },
        {
            name: '아이템 구입',
            amount: 300,
            type: 'out',
            date: '2024/7/26'
        },
        {
            name: '선생님이 줌',
            amount: 500,
            type: 'in',
            date: '2024/7/28'
        },
        {
            name: '아이템 구입',
            amount: 300,
            type: 'out',
            date: '2024/7/30'
        },
    ]
    return (
        <div className="flex justify-center items-center">
            <div className="bg-orange-100 px-[16px] py-[16px] rounded-xl flex flex-wrap justify-center">
                <div className="bg-green-400 p-[16px] rounded-xl">
                    <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                        <div >
                            <div className="flex items-center relative">
                                <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv 1</div>
                                <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">슬픈 고양이</div>
                            </div>
                        </div>
                        <div className="flex justify-center flex-col items-center my-[16px]">
                            <div className="w-[200px] h-[200px] rounded-full bg-white flex justify-center items-center">
                                {/* <Image src={male}/> */}
                                <img src="https://i.postimg.cc/HLXdVT11/orange.png" width="100" height="100" alt="orange" />
                                {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                            </div>
                            <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">초보 오렌지</div>
                        </div>
                        <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">천리길도 한걸음부터!</div>
                    </div>
                </div>
                <div className=" border-2  px-[32px] rounded-xl border-none" >
                    <h1 className="text-[2rem] mb-[16px] font-bold">화폐 및 아이템 사용 기록</h1>
                    <table className="table">
                        <thead>
                            <tr className="text-center">
                                <th>내용</th>
                                <th>돈</th>
                                <th>잔액</th>
                                <th>날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((a, i) => {
                                return (
                                    <tr key={i} className="text-center border-none">
                                        <td>{a.name}</td>
                                        <td>
                                            <span className={`${a.type === 'in' ? "text-green-500" : "text-red-500"}`}>
                                                {a.type === 'in' ? "+" : "-"}{a.amount}
                                            </span>
                                        </td>
                                        <td></td>
                                        <td>{a.date}</td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}