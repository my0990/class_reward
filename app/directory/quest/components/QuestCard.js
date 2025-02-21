'use client'
import Link from "next/link";
export default function QuestCard({data, studentCount, teacherId}) {
    const date = new Date(data.time);
    const onDelete = (e) => {
        e.preventDefault();
        fetch("/api/deleteQuest", {
            method: "POST",
            body: JSON.stringify({ data: data }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                location.reload();
            }
        })
    }

    return (
        <div>

            <div className="relative p-[16px] border-4 border-orange-500 rounded-xl mt-[24px] w-[100%] ">
                <div onClick={onDelete} className="absolute top-2 right-2 opacity-30 cursor-pointer hover:scale-110 hover:opacity-60 transition-all">
                   <svg height="24px"  viewBox="0 0 512 512" width="24px" style={{color:"orange"}}><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" /></svg>
                </div>
                <h1 className="text-[1.5rem] font-bold text-red-900">{data.questName}</h1>
                <div className="text-red-900 mb-[16px]">{data.questContent}</div>
                <div className="text-red-900 max-[400px]:hidden">발행일: {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일</div>
                <div className="flex justify-end ">
                    <div className="flex items-center">
                        <div className="flex mr-[16px] text-orange-500">
                            <svg className="feather feather-user" fill="none" height="24" stroke="orange" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>{data.finished.length}/{studentCount}</span>
                        </div>
                        <Link href={`./questDetail/${teacherId}/${data._id}`} key={data.id}><button className="btn bg-orange-500 border-0 text-white">상세보기</button></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}