
export default function CharacterCard(props) {
    return (
        <div>
            <div {...props} className="w-[160px] h-[168px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ">
                <h1 className="text-[1rem] font-bold text-center mb-[8px] overflow-hidden">{props.user.classNumber}. {props.user.profileNickname}</h1>
                <div className="flex justify-center items-center w-[110px] h-[110px] mb-[16px] mx-auto bg-white rounded-full">
                    <img src={props.user.profileUrl} width="100" height="100" alt="characther" className="rounded-full" />
                </div>
                <div className="mt-[8px] flex items-center justify-center">
                </div>
            </div>
        </div>
    )
}