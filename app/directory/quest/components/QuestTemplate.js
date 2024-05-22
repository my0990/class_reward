import QuestCard from "./QuestCard";
import AddQuestBtn from "./AddQuestBtn";
import AddQuestModal from "./AddQuestModal";
export default function QuestTemplate({data, studentNumber, userId }) {
    return (
        <div className="flex justify-center ">
            <div className="flex justify-center flex-col items-center bg-yellow-100 my-[32px] max-[600px]:my-0 p-[64px] max-[600px]:p-[16px] py-[40px] rounded-xl w-[600px] max-[600px]:w-[100%]">
                <div className="w-[100%] text-[2rem] text-red-900 font-bold ">
                    <span className="border-l-8 border-orange-500 pl-[16px]">발행된 임무 목록</span>
                </div>
                <div className="w-[100%]">
                    {data.map((a,i)=>{
                        return(
                            <QuestCard key={i} data={a} studentNumber ={studentNumber} userId={userId}/>
                        )
                    })}
                    <AddQuestBtn />
                </div>
            </div>
            <AddQuestModal />
        </div>
    )
}