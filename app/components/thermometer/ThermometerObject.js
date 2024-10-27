'use client'
import Reward from "./Reward"
import Scale from "./Scale"
import Degree from "./Degree"
export default function ThermometerObject({ reward, temp }) {
    let tmp = []
    let start = 95;
    for (let index = 0; index < 10; index++) {

        tmp.push(start)
        start += 33
    }


  

    return (
        <div  className="flex w-[120px] justify-center items-center flex-col relative h-[450px] ">

            <div  className="w-[60px] h-[450px] overflow-hidden bg-white border-8 border-white rounded-full  absolute flex justify-center">
                <div className="w-[48px]   bg-red-500  absolute z-10 bottom-20"  style={{height: temp + 'px'}}></div>
            </div>
            <div className="w-[100px] h-[100px] bg-red-500 rounded-full absolute bottom-2 z-10"></div>
            <div className="w-[116px] h-[116px] bg-white rounded-full absolute bottom-0"></div>
            {tmp.map((a, i) => {
                return (
                    <Scale degree={a} key={i}/>
                )
            })}
            {tmp.map((a, i) => {
                return (
                    <Degree degree={a} temp={i} key={i}/>
                )
            })}
            <Degree degree={425} temp={10} />

            {tmp.map((a, i) => 
                
                    reward[i * 10] !== ''
                    ? <Reward degree={a}  key={i}>{reward[i * 10]}</Reward>
                    : null
            )}
            {reward[100]!=='' ? <Reward degree={425}>{reward[100]}</Reward> : null }
        </div>


    )
}