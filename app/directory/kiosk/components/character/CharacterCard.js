
export default function CharacterCard(props) {
    return (
        <div>
        <div {...props} className="w-[160px] h-[168px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ">
            <h1 className="text-[1rem] font-bold text-center mb-[8px] overflow-hidden">{props.user.classNumber}. {props.user.profileNickname}</h1>
            <div className="flex justify-center w-[128px] h-[90px] mb-[16px]">
                <img src={props.user.profileUrl} width="90" height="90" alt="characther" />
            </div>
            <div className="mt-[8px] flex items-center justify-center">
            </div>
        </div>
        </div>
    )
}