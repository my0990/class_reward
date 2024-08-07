import CharacterCard from "./CharacterCard"
import CheckPwdModal from "./CheckPwdModal"

export default function CharacterPickTemplate(props) {
    const onClick = (a) => {
        console.log('character picked')
        console.log(a)
        document.getElementById('my_modal_3').showModal()
        props.setRequestData(prev => ({ ...prev, userId: a.userId, userMoney: a.money, userName: a.userName, checked: true, itemList: [...a.itemList] }))
       
    }
    // const [studentData,setStudentData] = useState(props.studentData);
    const currencyName = props.currencyName;
    const currencyEmoji = props.currencyEmoji;
    return (
        <div className="flex justify-center flex-col items-center">
            <h1 className="text-[3rem] text-center mb-[16px]">자신의 캐릭터를 선택해주세요</h1>
            <div className="flex flex-wrap">
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