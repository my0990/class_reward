// components/class/ClassDashboard.jsx
"use client";
import { fetchData } from "@/hooks/swrHooks";

export default function ClassDashboardView({ classId }) {
    // const { data, error, isLoading } = useSWR(`/api/classes/${classId}`, fetcher);
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData(`/api/classData?classId=${classId}`);
    const { data: studentsData, isLoading: isStudentsDataLoading, isError: isStudentsDataError } = fetchData(`/api/Students?classId=${classId}`);
    const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = fetchData(`/api/user`);
    const isLoading =
        isClassDataLoading ||
        isStudentsDataLoading ||
        isUserDataLoading;

    const isError =
        isClassDataError ||
        isStudentsDataError ||
        isUserDataError;
    if (isLoading) {
        return <div>불러오는 중...</div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }

    return (
        <div className=" pt-0 flex justify-center">

            <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div className="flex py-[16px] mr-[8px] justify-between">

                    {/* {isSelectedAll
                        ? <button className="btn bg-orange-500 text-white ml-[8px] " onClick={clearAll}>모두 해제</button>
                        : <button className="btn bg-orange-500 text-white ml-[8px] " onClick={selectAll}>모두 선택</button>}
                    <div>
                        <button className="btn btn-success text-white mr-[16px] " onClick={onSend}>{classData?.currencyName} 보내기</button>
                        <button className="btn bg-red-500 text-white" onClick={onTake}>{classData?.currencyName} 빼앗기</button>
                    </div> */}
                </div>

                {/* <div className=" flex flex-wrap">
                    {studentArr && studentArr.map((a, i) => {
                        return (
                            <StudentInfoCard  currencyemoji={currencyEmoji} exptable={expTable} key={i} isactive={a.isactive ? 1 : 0} onClick={(e) => onClick(a)} data={a}>{a.classNumber}. {a.profileNickname}</StudentInfoCard>
                        )
                    })}</div> */}
            </div>

            {/* <Modal targetStudent={studentArr.filter((a) => a.isactive === true)} studentArr={studentArr} isSend={isSend} currencyName={classData?.currencyName} clearAll={clearAll} /> */}

            {/* {isModalOpen && <input type="checkbox" id="setting" className="modal-toggle" checked readOnly />} */}


        </div>
    );
}