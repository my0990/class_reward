import { mutate } from "swr"
import { getGroupCombFromGrid, getGroupKeys } from "../../util/util";

export function GeneralTab({ setting }) {
    // const setting = { result: 0, color: "#fdba74" };
    // const setting = classData?.setting ?? { result: 0, color: "#fdba74" };



    // const onsettingClick = (setting) => {
    //     setsetting(prev => ({ ...prev, result: setting }))
    // }
    const onsettingClick = (value) => {
        mutate(
            "/api/fetchClassData",
            (prev) => ({
                ...prev,
                setting: {
                    ...(prev?.setting ?? { result: 0, color: "#fdba74" }),
                    result: value,
                },
            }),
            { revalidate: false }
        );
    };


    // const onColorClick = (color) => {
    //     setsetting(prev => ({ ...prev, color: { ...prev.color, code: color } }))

    //     console.log(classData)
    // }

    const onColorClick = (colorCode) => {

        mutate(
            "/api/fetchClassData",
            prev => ({
                ...prev,
                setting: {
                    ...prev.setting ?? { result: 0, color: "#fdba74" },
                    // ...prev.setting,
                    color: colorCode
                    ,
                },
            }), { revalidate: false });

    };

    const example = [
        {
            nickname: '순수한 미어캣',
            number: '1'
        },
        {
            nickname: '빠른 강아지',
            number: '2'
        },
        {
            nickname: '슬픈 부엉이',
            number: '3'
        },
        {
            nickname: '똑똑한 문어',
            number: '4'
        },
        {
            nickname: '귀여운 치와와',
            number: '5'
        },
        {
            nickname: '느린 오징어',
            number: '6'
        }
    ]
    const colorList = [
        { name: "orange", code: "#fdba74" },
        { name: "indigo", code: "#a5b4fc" },
        { name: "gray", code: "#d1d5db" },
        { name: "brown", code: "#B88746" },
        { name: "lime", code: "#bef264" },
        { name: "green", code: "#86efac" },
        { name: "violet", code: "#c4b5fd" },
        { name: "pink", code: "#f9a8d4" },

    ];



    return (
        <div >
            <h3 className="text-xl font-semibold mb-3">스타일 설정</h3>
            <div className="mb-5">

                <div className="w-[100%] relative text-[0.9rem] h-[160px] bg-blue-100 rounded-lg flex flex-col justify-center items-center">
                    <div className="flex">
                        {example.map((a, i) => {
                            if (a.number < 4) {
                                return (
                                    <div key={i} style={{ backgroundColor: setting.color }} className={` ${setting.result === 2 ? 'text-[1.5rem]' : null}   overflow-hidden text-ellipsis whitespace-nowrap flex justify-center  items-center rounded-lg w-[100px] h-[50px] m-[8px]`}>
                                        {setting.result === 0
                                            ? a.nickname
                                            : setting.result === 1
                                                ? a.number + '. ' + a.nickname
                                                : a.number}
                                    </div>

                                )
                            }

                        })}
                    </div>
                    <div className="flex">
                        {example.map((a, i) => {
                            if (a.number > 3) {
                                return (
                                    <div key={i} style={{ backgroundColor: setting.color }} className={`${setting.result === 2 ? 'text-[1.5rem]' : null}  flex justify-center  items-center rounded-lg w-[100px] h-[50px] m-[8px]`}>
                                        {setting.result === 0
                                            ? a.nickname
                                            : setting.result === 1
                                                ? a.number + '. ' + a.nickname
                                                : a.number}
                                    </div>

                                )
                            }

                        })}
                    </div>
                    <div className="absolute bottom-1 right-2 text-[0.8rem] opacity-70">이렇게 표시됩니다</div>
                </div>
            </div>
            <div className="mb-5">
                <div className="text-[1.2rem] mb-3">결과 표시</div>
                <div className="flex justify-center mx-[16px]">
                    <div onClick={() => onsettingClick(0)} className={`text-[1.2rem] cursor-pointer rounded-3xl ${setting.result === 0 ? "bg-blue-500 text-white" : "bg-blue-200"} px-[16px] py-[8px]`}>닉네임</div>
                    <div onClick={() => onsettingClick(1)} className={`text-[1.2rem] cursor-pointer rounded-3xl ${setting.result === 1 ? "bg-blue-500 text-white" : "bg-blue-200"} bg-blue-200 px-[16px] py-[8px] mx-[64px]`}>번호 + 닉네임</div>
                    <div onClick={() => onsettingClick(2)} className={`text-[1.2rem] cursor-pointer rounded-3xl ${setting.result === 2 ? "bg-blue-500 text-white" : "bg-blue-200"} bg-blue-200 px-[16px] py-[8px]`}>번호</div>
                </div>
            </div>
            <div>
                <div className="text-[1.2rem] ">책상 색깔</div>
                <div className="flex flex-wrap justify-center ">
                    {colorList.map((a, i) => {
                        return (
                            <div onClick={() => onColorClick(a.code)} key={i} className="m-[16px]  cursor-pointer hover:scale-110 transition-all duration-200 flex justify-center flex-col items-center">
                                <div style={{ backgroundColor: a.code }} className={`rounded-lg w-[100px] h-[50px]`}></div>
                                <label >{a.name}</label>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export function AccountTab({ studentData, classData }) {
    const studentGroupsMap = {};

    // 1. 학생마다 어떤 그룹에 속해있는지 정리
    if (classData) {
        for (const [groupKey, data] of Object.entries(classData.groupData)) {
            for (const student of data.groupMember) {
                if (!studentGroupsMap[student.userId]) {
                    studentGroupsMap[student.userId] = new Set();
                }
                studentGroupsMap[student.userId].add(groupKey);
            }
        }
    }
    const groupKeys = getGroupKeys({ gridData: classData.gridData })
    const isPossible = (a) => {
        for (let index = 0; index < groupKeys.length; index++) {
            console.log([...(studentGroupsMap?.[a.userId] ?? [])])

            if([...(studentGroupsMap?.[a.userId] ?? [])].every(g => groupKeys[index].includes(g))){
                return true
            }
            
        }
    }
    return (
        <div className="overflow-x-auto">
            <table className="table text-center">
                {/* head */}
                <thead>
                    <tr className="text-[1.2rem]">
                        <th></th>
                        <th>아이디</th>
                        <th>닉네임</th>
                        <th>자리 그룹</th>
                    </tr>
                </thead>
                <tbody>
                    {studentData.map((a, i) => {
                        const group = [...(studentGroupsMap?.[a.userId] ?? [])]
                            .map(key => classData?.groupData?.[key]?.groupName)
                            .filter(Boolean) // undefined 제거
                            .sort((a, b) => a.localeCompare(b, "ko"))
                            .join(", ")
                        

                        return (
                            <tr key={i}>
                                <th>{i + 1}</th>
                                <td>{a.userId}</td>
                                <td>{a.profileNickname}</td>
                                {/* <td>{classData?.groupData?.[studentGroupsMap?.[a.userId]]?.groupName ?? ""}</td> */}
                                <td className="flex justify-between" >
                                    {/* <div>{[...(studentGroupsMap?.[a.userId] ?? [])].map(key => classData?.groupData?.[key]?.groupName).join(", ")}</div> */}
                                    <div>
                                        {/* {[...(studentGroupsMap?.[a.userId] ?? [])]
                                            .map(key => classData?.groupData?.[key]?.groupName)
                                            .filter(Boolean) // undefined 제거
                                            .sort((a, b) => a.localeCompare(b, "ko"))
                                            .join(", ")} */}
                                        {group}
                                    </div>
                                    {isPossible(a)
                                        ? null
                                        : <div className="relative inline-block group">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6 text-red-500 cursor-pointer"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                                />
                                            </svg>

                                            <span
                                                className="
                                            pointer-events-none
                                            absolute -top-9 left-1/2 -translate-x-1/2
                                            whitespace-nowrap
                                            rounded bg-gray-800 px-2 py-1 text-xs text-white
                                            opacity-0
                                            group-hover:opacity-100
                                            transition-opacity duration-75
                                            "
                                            >
                                                배정 불가
                                            </span>
                                        </div>}

                                </td>
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>
    );
}

export function SecurityTab() {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-3">보안 설정</h3>
            <p className="text-gray-600">2단계 인증, 로그인 기록 등을 확인할 수 있습니다.</p>
        </div>
    );
}