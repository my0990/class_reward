'use client'
export default function Scale({degree}){

    return(
        <div className={`flex z-40  w-[105px] h-[10px] items-center absolute right-[-15px] justify-between `} style={{bottom: degree + 'px'}}>
            <div className="w-[32px] h-[6px] bg-red-300   mr-[16px] " ></div>
        </div>

    )
}