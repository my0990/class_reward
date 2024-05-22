'use client'

import { useState } from "react"

export default function QuestDetailTemplate({ response, response2 }) {
    let tmp = response2.map((a) => {
        let name = a.userName;
        console.log(name)
        return { ...a, done: response.done[name] }
    })
    console.log("response: ", response)
    console.log('temp')
    console.log(tmp)
    console.log(tmp)
    console.log(tmp)
    console.log(tmp)
    const [check, setCheck] = useState(tmp);
    // const [check,setCheck] = useState([{userName:'1', done: false},{userName:'2', done:false}]);
    // console.log(response2)
    // console.log(response2)
    const onChange = (e) => {
        const { name, value } = e.target;
        let tmp = check.map((a) => { return a.userName != name ? a : { ...a, done: !a.done } })
        setCheck(tmp)
        console.log(tmp)
    }
    return (
        // <div className="flex justify-center">
        // <div className="bg-yellow-100 text-[1.4rem] text-red-900 p-[24px] w-[100%] max-w-[768px] min-[768px]:mt-[24px]">
        //     <div className="text-[2.2rem]  font-bold">{response?.questName}</div>
        //     <div className=" text-red-900">{response?.questContent}</div>
        //     <div>보상: {response?.questReward}원</div>
        //     <div className="flex flex-wrap mt-[24px]">
        //         {check.map((a, i) => {
        //             return (
        //                 <div key={i} className=" text-center mb-[8px]">
        //                     <label for={i}>{a.userName}</label>
        //                     <input id={i} type="checkbox" className=" ml-[16px] checkbox [--chkbg:theme(colors.orange.500)]" name={a.userName} checked={a.done} onChange={onChange} />
        //                 </div>
        //             )
        //         })}
        //     </div>
        // </div>
        // </div>
        // <div className="overflow-x-auto">
        //     <table className="table text-center">
        //         {/* head */}
        //         <thead>
        //             <tr >
        //                 <th>이름</th>
        //                 <th className="max-[600px]:hidden">소개</th>
        //                 <th className="max-[600px]:hidden">소지금</th>
        //                 <th>
        //                     <label>
        //                         <input type="checkbox" className="checkbox" />
        //                     </label>
        //                 </th>
        //             </tr>
        //         </thead>
        //         <tbody>
        //             {/* row 1 */}
        //             {check.map((a, i) => {
        //                 return (
        //                     <tr>

        //                         <td>
        //                             <div className="flex items-center gap-3 justfiy-center ml-[20%]">
        //                                 <div className="avatar">
        //                                     <div className="mask mask-squircle w-12 h-12">
        //                                         <img src="https://img.daisyui.com/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component" />
        //                                     </div>
        //                                 </div>
        //                                 <div>
        //                                     <div className="font-bold text-start">{a.userName}</div>
        //                                     <div className="text-sm opacity-50">{a.nickname}</div>
        //                                 </div>
        //                             </div>
        //                         </td>
        //                         <td className="max-[600px]:hidden">
        //                             {a.profileState}
        //                         </td>
        //                         <td className="max-[600px]:hidden">{a.money}원</td>
        //                         <th>
        //                             <label>
        //                                 <input type="checkbox" className="checkbox" />
        //                             </label>
        //                         </th>
        //                     </tr>
        //                 )
        //             })}
        //             {/* row 2 */}
        //         </tbody>

        //     </table>
        // </div>
        <div className="flex justify-center">
            <div className="text-[1.2rem] mt-[16px] text-orange-500 flex flex-col justify-center w-[896px] max-[896px]:w-[744px] max-[744px]:w-[592px] max-[592px]:w-[440px] max-[440px]:w-[288px]">
                <div className="flex items-center">
                    <h1 className="text-[2rem] font-bold ">{response?.questName}</h1>
                    <div className="badge bg-orange-500 text-white ml-[8px]">100,000</div>
                </div>
                <h2 className="text-orange-300">{response?.questContent}</h2>

                <div className="flex flex-wrap justify-start gap-[16px] mt-[16px]">
                    {check.map((a, i) => {
                        return (
                            // <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px]">
                            //     {a.userName}
                            // </div>
                            <label className="swap swap-flip text-9xl" key={i}>

                                {/* this hidden checkbox controls the state */}
                                <input type="checkbox" />

                                <div className="swap-on relative">
                                    <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px] opacity-30">
                                        {a.userName}

                                    </div>
                                    <div className="text-red-500 w-[136px] h-[180px] absolute flex justify-center top-0 items-center font-bold text-[1.7rem]">Checked</div>
                                </div>
                                <div className="swap-off">
                                    <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px]">
                                        {a.userName}
                                    </div>
                                </div>
                            </label>
                        )
                    })}

                </div>
            </div>
        </div>
    )
}