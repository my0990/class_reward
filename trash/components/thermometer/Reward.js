export default function Reward({children, degree}){
    return(
        <div className="flex absolute h-[30px] left-[100px] z-50 overflow-hidden items-center cursor-default hover:scale-110 transition-all  " style={{bottom: degree + 'px'}}>
            <div className="w-0 h-0 " style={{borderTop:"12px solid transparent", borderRight: "16px solid rgb(251 146 60)", borderBottom: "12px solid transparent"}}></div>
            <div className=" truncate h-[24px] bg-orange-400 z-50  w-max max-w-[80px] hover:text-clip hover:max-w-[1000px]" >{children}</div>
        </div>
    )
}