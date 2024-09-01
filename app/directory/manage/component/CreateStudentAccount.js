import DeleteModal from "./modal/DeleteModal";
import DetailModal from "./modal/DetailModal";
import PickNumber from "./modal/PickNumber";
import ResetModal from "./modal/ResetModal";
import { useState } from "react";
export default function CreateStudentAccount({ result, arr, setArr, studentData }) {
    console.log(studentData)
    const { currencyName, currencyEmoji } = result.classData;
    const [picked, setPicked] = useState(null);
    const onResetClick = (a) => {
        document.getElementById('my_modal_1').showModal();
        setPicked(a)
    }
    const onDeleteClick = (a) => {
        document.getElementById('my_modal_3').showModal();
        setPicked(a)
    }
    const onDetailClick = (a) => {
        document.getElementById('my_modal_4').showModal();
        setPicked(a)
    }
    return (
        <div>
            <div>
                <div>
                    <div className="overflow-x-auto">
                        <div className="text-end">
                            <button className="border-2 bg-orange-300 rounded-lg p-[8px] cursor-pointer border-none font-bold hover:bg-orange-400" onClick={() => document.getElementById('my_modal_2').showModal()}>계정 생성</button>
                        </div>
                        <table className="table text-[1.2rem]">
                            {/* head */}
                            <thead>
                                <tr className="text-[1.2rem] text-center">
                                    <th>아이디</th>
                                    <th>닉네임</th>
                                    {/* <th>닉네임</th> */}
                                    <th>{currencyEmoji} 소지{currencyName}</th>
                                    <th>계정 관리</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {studentData.map((a, i) => {
                                    return (
                                        <tr key={i}>
                                            <td onClick={(e) => onDetailClick(a)} className="cursor-pointer transition-all hover:bg-orange-200 rounded-xl">{a.userId}</td>
                                            <td>{a.profileNickname}</td>
                                            <td>{a.money}{currencyName}</td>
                                            <td className="p-[8px] flex">
                                                <div className="flex justify-center w-full">
                                                    <button onClick={(e) => onResetClick(a)} className="btn bg-green-500 border-0 text-white text-[0.8rem] mr-[8px]">비밀번호<br />초기화</button>
                                                    <button onClick={(e) => onDeleteClick(a)} className="btn bg-red-500 border-0 text-white text-[0.8rem]">계정<br />삭제</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <PickNumber result={result} arr={arr} setArr={setArr} />
            <DeleteModal picked={picked} teacher={result.userId}/>
            <ResetModal picked={picked} teacher={result.userId} />
            <DetailModal picked={picked}/>
        </div>
    )
}