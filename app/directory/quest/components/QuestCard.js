import Link from "next/link";


export default function QuestCard(props) {
    const date = props.data.time;

    return (
        <div className="p-[16px] border-4 border-orange-500 rounded-xl mt-[24px] w-[100%]">
            <h1 className="text-[1.5rem] font-bold text-red-900">{props.data.questName}</h1>
            <div className="text-red-900">{props.data.questContent}</div>
            <div className="text-red-900 max-[400px]:hidden">발행일: {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일까지</div>
            <div className="flex justify-end ">
                <div className="flex items-center">
                    <div className="flex mr-[16px] text-orange-500">
                        <svg class="feather feather-user" fill="none" height="24" stroke="orange" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{props.data.doneCount}/{props.studentNumber}</span>
                    </div>
                    <Link href={`./questDetail/${props.userId}/${props.data.id}`}><button className="btn bg-orange-500 border-0 text-white">상세보기</button></Link>
                </div>
            </div>
        </div>
    )
}