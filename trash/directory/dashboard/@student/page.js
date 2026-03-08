'use client'
import { fetchData } from "@/hooks/swrHooks";
import ProfileImgModal from "./components/ProfileImgModal";
import TitleModal from "./components/TitleModal";
export default async function Page() {



    const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = fetchData('/api/fetchUserData');
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');



    if (isUserDataLoading || isClassDataLoading) return <div>Loading data...</div>;
    if (isUserDataError || isClassDataError) return <div>Error loading data</div>;
    const {startExp, commonDifference} = classData.expTable;
    const {currencyName, currencyEmoji} = classData;
    const {exp} = userData;
    const findLargestSumUnderTarget = () => {
        if(userData && classData){
            let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * exp)) / (2 * commonDifference));
            let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if(sumK > exp){
            return k
        } else {
            return k+1
        }
    }
    };

    return (
        <div className="flex justify-center py-[100px]">
            <div className="max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
            <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                <div className="flex items-center justify-between">
                    <div >
                        <div className="text-[1.2rem]  flex justify-center items-center font-bold border-b-[6px] px-[4px] border-green-400">lv {findLargestSumUnderTarget()}</div>
                    </div>
                    <div className="bg-white rounded-full py-[8px] px-[16px]">
                        {currencyEmoji} {userData.money}
                    </div>
                </div>
                <div className="flex justify-center flex-col items-center my-[16px]">
                    <div onClick={()=>document.getElementById('profileImgModal')?.showModal()} className="border-[6px] border-white bg-white cursor-pointer transition-all hover:scale-105 w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
                        <img src={userData.profileUrl} width="165" height="165" alt="orange" />
                    </div>
                    <ProfileImgModal userData={userData}/>
                    <div   className="text-[1.6rem] ">{userData.classNumber}. {userData.profileNickname}</div>
                    <TitleModal userData={userData}/>
                    <div onClick={()=>document.getElementById('profileTitleModal')?.showModal()} className="cursor-pointer hover:scale-105 transition-all py-[4px] px-[32px] text-center text-[1.2rem]  bg-green-400 text-white font-bold rounded-lg">{userData?.profileTitle}</div>
                </div>
                <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{userData?.profileState}</div>
            </div>
        </div>
        </div>

    )
}