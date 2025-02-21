'use client'

export default function StudentInfoCard(props) {
    return (
        <div {...props} className={`w-[120px] m-[8px] ${props.isactive ? "bg-orange-500" : ""} h-[160px] bg-orange-300 rounded-[5%] flex flex-col justify-center items-center cursor-pointer`}>
            <div className="w-[90px] h-[90px] bg-white rounded-full mb-3 overflow-hidden flex justify-center items-center">
                <img src={props.data.profileUrl} width="80" height="80" alt="orange" className="rounded-full"/>
            </div>
            <div className="text-[1rem] font-bold">{props.children}</div>
        </div>
    )
}