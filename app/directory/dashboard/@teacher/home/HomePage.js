'use client'

import StudentInfoCard from "./components/StudentInfoCard";
import { useState, useEffect } from "react";
import Modal from "./components/Modal";
import InstallPrompt from "../../component/InstallPrompt";
import SetCurrencyNameModal from "./components/SetCurrencyNameModal";
import { userDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";

import { fetchData } from "@/hooks/swrHooks";
import { mutate } from "swr";
import util from './utils/util'

export default function Home() {
    const { swrResult, isLoading, isError, mutateUser } = fetchData('/api/fetchStudentData');
    const [data, setClassData] = useRecoilState(userDataState);
    const { classData } = data;
    const [isSend, setIsSend] = useState(false);
    const [isSelectedAll, setIsSelectedAll] = useState(false);
    const [studentArr, setStudentArr] = useState([]);
    const {onClick,selectAll,clearAll,onSend,onTake} = util({setStudentArr, setIsSelectedAll, studentArr, setIsSend});
    useEffect(() => {
        if (swrResult) {
            const updatedData = swrResult.map(obj => {
                return { ...obj, isactive: false }; // 새로운 키-값 쌍 추가하여 새로운 객체 반환
            });
          // 로컬 캐시 업데이트
          setStudentArr(updatedData)
        }
      }, [swrResult]);

    // const onClick = (a) => {
    //     setStudentArr((prev) => {
    //         return prev.map(obj =>
    //             obj._id === a._id ? { ...obj, isactive: !a.isactive } : obj
    //         );
    //     });
    // }
    // const selectAll = () => {
    //     setIsSelectedAll(true)
    //     setStudentArr((prev) => {
    //         return prev.map(obj =>
    //             ({ ...obj, isactive: true }))
    //     })
    // }
    // const clearAll = () => {
    //     setIsSelectedAll(false)
    //     setStudentArr((prev) => {
    //         return prev.map(obj =>
    //             ({ ...obj, isactive: false }))
    //     })
    // }
    // const onSend = () => {
    //     if (studentArr.filter((a) => a.isactive === true).length === 0) {
    //         alert('학생을 선택해주세요')
    //         return
    //     }
    //     setIsSend(true);
    //     document.getElementById('modal').showModal();
    // }
    // const onTake = () => {
    //     if (studentArr.filter((a) => a.isactive === true).length === 0) {
    //         alert('학생을 선택해주세요')
    //         return
    //     }
    //     setIsSend(false);
    //     document.getElementById('modal').showModal();
    // }
    useEffect(() => {
        if (classData.currencyEmoji === "" || classData.currencyName === "" ) {
            document.getElementById('setting')?.showModal();

        }
    })
    if (isLoading) return <div>Loading data...</div>;
    if (isError) return <div>Error loading data</div>;
    return (
        <div className=" pt-0 flex justify-center">
            <div className="w-[1360px] max-[1360px]:w-[1224px] max-[1224px]:w-[1088px] max-[1088px]:w-[952px] max-[952px]:w-[816px] max-[816px]:w-[680px] max-[680px]:w-[544px] max-[544px]:w-[408px] max-[408px]:w-[272px]">
                <div className="flex py-[16px] mr-[8px] justify-between">

                    {isSelectedAll
                        ? <button className="btn bg-orange-500 text-white ml-[8px] " onClick={clearAll}>모두 해제</button>
                        : <button className="btn bg-orange-500 text-white ml-[8px] " onClick={selectAll}>모두 선택</button>}
                    <div>
                        <button className="btn btn-success text-white mr-[16px] " onClick={onSend}>{classData?.currencyName} 보내기</button>
                        <button className="btn bg-red-500 text-white" onClick={onTake}>{classData?.currencyName} 빼앗기</button>
                    </div>
                </div>

                <div className=" flex flex-wrap">
                    {studentArr && studentArr.map((a, i) => {
                        return (
                            <StudentInfoCard key={i} isactive={a.isactive ? 1 : 0} onClick={(e) => onClick(a)} data={a}>{a.classNumber}. {a.profileNickname}</StudentInfoCard>
                        )
                    })}</div>
            </div>

            <Modal targetStudent={studentArr.filter((a) => a.isactive === true)} isSend={isSend} currencyName={classData?.currencyName} clearAll={clearAll}/>
            <InstallPrompt />
            {classData.currencyEmoji === "" || classData.currencyName === "" ?  <SetCurrencyNameModal /> : null}
        </div>
    )
}
// }