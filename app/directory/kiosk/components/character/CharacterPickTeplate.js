import CharacterCard from "./CharacterCard"
import CheckPwdModal from "./CheckPwdModal"
import { useRecoilState } from 'recoil';
import { userDataState, stepDataState, requestDataState, studentDataState } from '@/store/atoms';

export default function CharacterPickTemplate({ type }) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const [studentData, setStudentData] = useRecoilState(studentDataState);
    const { currencyEmoji, currencyName } = userData.classData;
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        setRequestData(prev => ({ ...prev, userId: a.userId, userMoney: a.money, userName: a.userName, checked: true, itemList: [...a.itemList], userNumber: a.classNumber, userNickname: a.profileNickname, teacher: a.teacher }))

    }
    const onPrevious = () => {
        if (type === "buy") {
            setStepData({ menu: "buy", step: 'buyItemPick' })
        } else if(type === "use") {
            setStepData({ menu: "home", step: null })
        } else {
            setStepData({menu: "thermometer", step: 'thermometerBoard'})
        }
    }
    return (
        <div className="flex justify-center flex-col items-center overflow-hidden " >
            <div className="flex items-center justify-between w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div className="flex mr-auto cursor-pointer hover:scale-110 transition-all" onClick={onPrevious}>
                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>  
                    <div className="flex items-center text-[2rem]" onClick={onPrevious}>이전</div>
                </div>
                <h1 className="text-[2rem] flex items-center">계정 선택</h1>
                <div className=" opacity-0 flex mr-auto cursor-pointer hover:scale-110 transition-all" onClick={() => setStepData({ menu: 'home', step: null })}>
                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>
                    <div className="flex items-center text-[2rem]">이전</div>
                </div>
            </div>

            <div className="flex flex-wrap w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                {studentData.map((a, i) => {
                    return (
                        <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyName={currencyName} currencyEmoji={currencyEmoji} />
                    )
                })}
            </div>
            {/* <button className="btn text-center mt-[18px]" onClick={() => setStepData({ menu: 'home', step: null })} >처음으로</button> */}
            <CheckPwdModal type={type} />
        </div>
    )
}