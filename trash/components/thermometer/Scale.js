'use client'
export default function Scale({degree}){

    return(
        <div className={`flex z-30  w-[105px] h-[30px] items-center absolute right-[-15px] justify-between `} style={{bottom: degree + 'px'}}>
            <div className="w-[40px] h-[4px] bg-black mr-[16px] " ></div>
        </div>

    )
}