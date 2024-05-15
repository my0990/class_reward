import QuestCard from "./QuestCard";
import AddQuest from "./AddQuest";
export default function QuestTemplate() {
    return (
        <div className="flex justify-center ">
            <div className="flex justify-center flex-col items-center bg-yellow-100 my-[32px] max-[600px]:my-0 p-[64px] max-[600px]:p-[16px] py-[40px] rounded-xl w-[600px] max-[600px]:w-[100%]">
                <div className="w-[100%] text-[2rem] text-red-900 font-bold ">
                    <span className="border-l-8 border-orange-500 pl-[16px]">발행된 임무 목록</span>
                </div>
                <div className="w-[100%]">
                    <QuestCard>가정통신문 제출(현장체험학습 수요조사서)</QuestCard>
                    <QuestCard>실험관찰 제출</QuestCard>
                    <QuestCard>수학익힘책 풀기</QuestCard>
                    <QuestCard>미술작품 검사받기</QuestCard>
                    <AddQuest />
                </div>
            </div>
        </div>
    )
}