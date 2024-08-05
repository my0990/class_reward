import PickNumber from "./modal/PickNumber";

export default function CreateStudentAccount({ result, arr, setArr, studentData}) {
    const {currencyName,currencyEmoji} = result.classData;
    return (
        <div>
            <div>
                <div>
                    <div className="overflow-x-auto ">
                        <div className="text-end">
                            <button className="border-2 bg-orange-300 rounded-lg p-[8px] cursor-pointer" onClick={() => document.getElementById('my_modal_2').showModal()}>계정 생성</button>
                        </div>
                        <table className="table text-[1.2rem]">
                            {/* head */}
                            <thead>
                                <tr className="text-[1.2rem] text-center">
                                    <th>번호</th> 
                                    <th>아이디</th>
                                    <th>닉네임</th>
                                    <th>{currencyEmoji} 소지{currencyName}</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {studentData.map((a,i)=>{
                                    return(
                                        <tr key={i}>
                                            <th>{i+1}</th>
                                            <td>{a.userId}</td>
                                            <td>{a.profileNickname}</td>
                                            <td>{a.money}{currencyName}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <PickNumber result={result} arr={arr} setArr={setArr}/>
        </div>
    )
}