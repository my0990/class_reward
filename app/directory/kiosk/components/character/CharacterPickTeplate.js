import CharacterCard from "./CharacterCard"
import CheckPwdModal from "./CheckPwdModal"
import { useRecoilState } from 'recoil';
import { userDataState, stepDataState, requestDataState, studentDataState} from '@/store/atoms';

export default function CharacterPickTemplate({type}) {
    const [userData,setUserData] = useRecoilState(userDataState);
    const [stepData,setStepData] = useRecoilState(stepDataState);
    const [requestData,setRequestData] = useRecoilState(requestDataState);
    const [studentData,setStudentData] = useRecoilState(studentDataState);
    const {currencyEmoji, currencyName} = userData.classData;
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        setRequestData(prev => ({ ...prev, userId: a.userId, userMoney: a.money, userName: a.userName, checked: true, itemList: [...a.itemList], userNumber: a.classNumber, userNickname: a.profileNickname, teacher: a.teacher }))
       
    }

    return (
        <div className="flex justify-center flex-col items-center overflow-hidden">
            <h1 className="text-[3rem] text-center mb-[16px]">자신의 계정을 선택해주세요</h1>
            <div className="flex flex-wrap w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                {studentData.map((a, i) => {
                    return (
                        <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyName={currencyName} currencyEmoji={currencyEmoji}/>
                    )
                })}
            </div>
            <button className="btn text-center mt-[18px]" onClick={() => setStepData({menu:'home',step:null})} >처음으로</button>
            <CheckPwdModal type={type}/>
        </div>
    )
}