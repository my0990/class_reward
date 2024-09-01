'use client'

import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { userData } from '@/store/atoms';
export default  function Test() {
    const [data, setData] = useRecoilState(userData);



    console.log(data)
    
    return (
        <div className="flex justify-center items-center">
            <div className="bg-orange-100 px-[16px] py-[16px] rounded-xl flex flex-wrap justify-center">
                {/* {data} */}
                <button onClick={()=>setData(prev => prev+1)}>test</button>
            </div>
        </div>
    )
}