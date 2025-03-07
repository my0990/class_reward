'use client'

import { useState, useEffect } from "react"
import FinishQuestModal from "./finishQuestModal"
import DeleteQuestCardModal from "./deleteQuestCardModal"
import { fetchData } from "@/hooks/swrHooks"
import EditQuestModal from "./EditQuestModal"
import ResetQuestModal from "./ResetQuestModal"

export default function QuestDetail({ params, role }) {
    const { code } = params;
    const { data: questDetailData, isLoading: isQuestDetailLoading, isError: isQuestDetailError } = fetchData(code ? `/api/fetchQuestDetail/${code}` : null);
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const [isSelectedAll, setIsSelectedAll] = useState(false);
    const [studentArr, setStudentArr] = useState([]);

    useEffect(() => {
        if (studentData) {


            const updatedData = studentData.map(obj => {
                return { ...obj, isactive: false }; // 새로운 키-값 쌍 추가하여 새로운 객체 반환
            });
            // 로컬 캐시 업데이트
            setStudentArr(updatedData)
        }
    }, [studentData]);

    const onClick = (a) => {
        setStudentArr((prev) => {
            return prev.map(obj =>
                obj._id === a._id ? { ...obj, isactive: !a.isactive } : obj
            );
        });
    }
    const selectAll = () => {
        setIsSelectedAll(true)



        const updatedStudents = studentArr.map(a =>
            questDetailData.finished.includes(a.userId)
                ? a // 제출한 학생은 그대로
                : { ...a, isactive: true } // 제출 안 한 학생만 isActive 변경
        );
        setStudentArr(updatedStudents)

    }
    const clearAll = () => {
        setIsSelectedAll(false)
        setStudentArr((prev) => {
            return prev.map(obj =>
                ({ ...obj, isactive: false }))
        })
    }
    const onFinish = () => {
        if (studentArr.filter((a) => a.isactive === true).length === 0) {
            alert('학생을 선택해주세요')

        } else {
            document.getElementById('my_modal_2').showModal();
        }

    }
    if (isQuestDetailLoading || isStudentDataLoading || isClassDataLoading) return <div>Loading data...</div>;
    if (isQuestDetailError || isStudentDataError || isClassDataError) return <div>Error loading data</div>;

    const studentCount = studentData.length;
    return (
        <div className="flex justify-center ">
            <div className="text-[1.2rem]  rounded-lg   mt-[32px] text-orange-500 flex flex-col justify-center w-[896px] max-[896px]:w-[744px] max-[744px]:w-[592px] max-[592px]:w-[440px] max-[440px]:w-[288px]">


                <div className="bg-orange-100 rounded-lg p-[24px] flex justify-between flex-wrap">
                    <div>
                        <div className="flex items-center">
                            <h1 className="text-[2rem] font-bold mr-[8px]">{questDetailData?.questName}</h1>
                            <div className="flex mr-[16px] text-orange-400 items-center">
                                <svg className="feather feather-user" fill="none" height="24" stroke="orange" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span className="font-light">{questDetailData.finished.length}/{studentCount}</span>
                            </div>
                        </div>
                        <h2 className="text-black">{questDetailData?.questGoal}</h2>
                    </div>
                    <div className=" bg-white rounded-lg text-black w-[320px] p-[16px]">
                        <div className="text-[1.5rem] font-bold mb-[4px] text-orange-500">보상</div>
                        {questDetailData?.questReward && <div>- {questDetailData?.questReward}{classData?.currencyName}</div>}
                        {questDetailData?.questExp && <div>- {questDetailData?.questExp}경험치</div>}
                        {questDetailData?.questTitle && <div>- 칭호 획득: {questDetailData?.questTitle}</div>}
                    </div>
                </div>
                <div className="mt-[32px]">
                    {role === 'teacher'
                        ? <div className="flex justify-between mb-[8px]">
                            <button onClick={() => document.getElementById('editQuestModal').showModal()} className="flex justify-center items-center bg-white outline-none border-none rounded-full hover:bg-orange-100 transition-all w-[48px] h-[48px] hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 30 30">
                                    <path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
                                </svg>
                            </button>
                            <EditQuestModal currencyEmoji={classData.currencyEmoji} questDetailData={questDetailData} code={code}/>
                            <div>
                                <button onClick={() => document.getElementById('resetModal').showModal()} className="btn bg-red-500 text-white mr-[8px]" >초기화</button>
                                <ResetQuestModal data={questDetailData} code={code} />
                                {isSelectedAll
                                    ? <button className="btn bg-orange-500 text-white" onClick={clearAll}>모두 해제</button>
                                    : <button className="btn bg-orange-500 text-white" onClick={selectAll}>모두 선택</button>}
                            </div>
                        </div>
                        : null}
                    <div className="flex flex-wrap justify-start gap-[16px] ">

                        {studentArr.map((a, i) => {
                            if (questDetailData.finished.includes(a.userId)) {
                                return (
                                    <div className="relative" key={a._id}>
                                        <div className="bg-orange-200 text-gray-600 rounded-lg font-bold text-[1.1rem]  flex justify-center items-center  w-[136px] h-[180px] opacity-30">
                                            {a['classNumber']}. {a['profileNickname']}
                                        </div>
                                        <div className="text-red-500 w-[136px] h-[180px] absolute flex justify-center top-0 items-center font-bold text-[1.7rem]">Checked</div>
                                    </div>
                                )
                            }
                            return (
                                // <label className="swap swap-flip text-9xl" key={i}>
                                //     {role === "teacher"
                                //         ? <input type="checkbox" checked={a.done} onChange={onChange} name={a['userId']} />
                                //         : <input type="checkbox" checked={a.done} readOnly name={a['userId']} />}


                                //     <div className="swap-on relative">
                                //         <div className="bg-orange-200 text-gray-600 rounded-lg font-bold text-[1.1rem]  flex justify-center items-center  w-[136px] h-[180px] opacity-30">
                                //             {a['classNumber']}. {a['profileNickname']}
                                //         </div>
                                //         <div className="text-red-500 w-[136px] h-[180px] absolute flex justify-center top-0 items-center font-bold text-[1.7rem]">Checked</div>
                                //     </div>

                                <div key={a._id} onClick={(e) => onClick(a)} className={` ${a.isactive ? "bg-orange-400" : undefined} bg-orange-200 cursor-pointer text-gray-600 rounded-lg font-bold text-[1.1rem]  flex justify-center items-center  w-[136px] h-[180px]`}>
                                    {a['classNumber']}. {a['profileNickname']}
                                </div>

                                // </label>
                            )
                        })}
                    </div>
                </div>
                {role === "teacher"
                    ? <div>
                        <button className="w-[100%] btn mt-[48px] shadow-none text-white hover:bg-red-600 bg-red-400 border-0  font-bold text-[1.4rem]" onClick={onFinish}>보상 지급</button>
                        <button className="w-[100%] btn mt-[16px] mb-[16px] shadow-none text-white hover:bg-orange-500 bg-orange-300 border-0  font-bold text-[1.4rem]" onClick={() => document.getElementById('my_modal_3').showModal()}>퀘스트 삭제</button>
                    </div>
                    : null
                }

            </div>
            <FinishQuestModal rewardedUserData={studentArr.filter((a) => a.isactive === true)} questData={questDetailData} currencyName={classData.currencyName} clearAll={clearAll} code={code} />
            <DeleteQuestCardModal data={questDetailData} />
        </div>



    )

}