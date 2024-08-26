import CharacterCard from "./CharacterCard"
import CheckPwdModal from "./CheckPwdModal"

export default function CharacterPickTemplate(props) {
    const onClick = (a) => {
        console.log('character picked')
        console.log(a)
        document.getElementById('my_modal_3').showModal()
        props.setRequestData(prev => ({ ...prev, userId: a.userId, userMoney: a.money, userName: a.userName, checked: true, itemList: [...a.itemList], userNumber: a.classNumber, userNickname: a.profileNickname, teacher: a.teacher }))
       
    }
    // const [studentData,setStudentData] = useState(props.studentData);
    const currencyName = props.currencyName;
    const currencyEmoji = props.currencyEmoji;
    return (
        <div className="flex justify-center flex-col items-center">
            <h1 className="text-[3rem] text-center mb-[16px]">자신의 계정을 선택해주세요</h1>
            <div className="flex flex-wrap w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                {props.studentData.map((a, i) => {
                    return (
                        <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyName={currencyName} currencyEmoji={currencyEmoji}/>
                    )
                })}
            </div>
            <button className="btn text-center mt-[18px]" onClick={() => props.setStep('home')} >처음으로</button>
            <CheckPwdModal requestData={props.requestData} setIsPwdChecked={props.setIsPwdChecked} isPwdChecked={props.isPwdChecked}/>
        </div>
    )
}