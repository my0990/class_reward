import CharacterCard from "@/app/kiosk/components/character/CharacterCard";
import CheckPwdModal from "@/app/kiosk/components/character/CheckPwdModal";
import ItemBuyCard from "./ItemBuyCard";
import { fetchData } from "@/hooks/swrHooks";

export default function CharacterPickTemplate({ type, requestData, setRequestData }) {
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');


    console.log(requestData);
    const { itemName, itemPrice, itemExplanation, itemStock, emoji } = requestData.itemData;
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        setRequestData(prev => ({ ...prev, userData: a }))

    }
    const onPrevious = () => {
        if (type === "buy") {
            setRequestData(prev => ({ ...prev, step: "buyItemPick" }))
        } else if (type === "use") {
            setRequestData({ menu: "home", step: null })
        } else {
            setRequestData({ menu: "thermometer", step: 'thermometerBoard' })
        }
    }

    if (isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isClassDataError || isStudentDataError) return <div>Error loading data</div>;

    const { currencyEmoji, currencyName } = classData;
    const {startExp, commonDifference} = classData.expTable;
    return (
        // <div className="">
        //     <div className="flex justify-center">
        //         <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
        //             <div className="flex justify-center flex-col items-center overflow-hidden " >
        //                 <div className="flex items-center justify-between w-full">
        //                     <div className="flex mr-auto cursor-pointer hover:scale-110 transition-all" onClick={onPrevious}>
        //                         <div className="h-[64px] w-[24px] flex items-center">
        //                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
        //                         </div>
        //                         <div className="flex items-center text-[2rem]" >이전</div>
        //                     </div>
        //                     <h1 className="text-[2rem] flex items-center">계정 선택</h1>
        //                     <div className="opacity-0 flex mr-auto cursor-pointer hover:scale-110 transition-all">
        //                         <div className="h-[64px] w-[24px] flex items-center">
        //                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
        //                         </div>
        //                         <div className="flex items-center text-[2rem]">이전</div>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="flex flex-wrap ">
        //                 {studentData.map((a, i) => {
        //                     return (
        //                         <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyname={currencyName} currencyemoji={currencyEmoji} />
        //                     )
        //                 })}
        //             </div>
        //         </div>
        //     </div>
        //     <button className="btn text-center mt-[18px]"  >처음으로</button>
        //     <CheckPwdModal type={type} requestData={requestData} setRequestData={setRequestData} />
        // </div>


        <div className="flex flex-col items-center justify-center ">
            <div className="w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div className="flex items-center justify-between w-full">
                    <div className="flex mr-auto cursor-pointer hover:scale-110 transition-all" onClick={onPrevious}>
                        <div className="h-[64px] w-[24px] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                        </div>
                        <div className="flex items-center text-[2rem]" >이전</div>
                    </div>
                    <h1 className="text-[2rem] flex items-center">Home</h1>
                    <div className="opacity-0 flex mr-auto cursor-pointer hover:scale-110 transition-all">
                        <div className="h-[64px] w-[24px] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                        </div>
                        <div className="flex items-center text-[2rem]">이전</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col mt-[16px] w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div>
                    <div className="ml-[8px] text-[1.5rem]">
                        선택된 아이템
                    </div>
                    <div className="p-[32px] flex   bg-orange-100 rounded-xl mt-[8px]">
                        <div className="text-[136px] text-center leading-none mr-[32px]">
                            {emoji}
                        </div>
                        <div>
                            <div className="text-[1.6rem]  whitespace-nowrap overflow-hidden text-ellipsis ">
                                {itemName}
                            </div>
                            <div className="text-gray-500 text-[1.4rem] overflow-y-auto mb-[8px]">
                                {itemExplanation}
                            </div>
                            <div className=" flex">
                                <div className="text-[1.2rem]">남은수량: {itemStock}</div>
                            </div>
                            <div className="text-[1.5rem] text-red-500 mt-[8px]">
                                {itemPrice}<span className="ml-[4px]">{currencyName}</span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="mt-[32px] pb-[32px]">
                    <div className="ml-[8px] text-[1.5rem]">계정을 선택해주세요</div>
                    <div className="flex flex-wrap ">
                        {studentData.map((a, i) => {
                            return (
                                <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyname={currencyName} currencyemoji={currencyEmoji} startExp={startExp} commonDifference={commonDifference}/>
                            )
                        })}
                    </div>
                </div>


            </div>
            <CheckPwdModal type={type} requestData={requestData} setRequestData={setRequestData} />
        </div>
    )
}