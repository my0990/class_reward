'use client'
import { useState, useEffect } from "react"
import CreateUniqueNickname from "./component/CreateUniqueNickname"
import CreateStudentAccount from "./component/CreateStudentAccount";
export default function CreateAccount() {
    const [uniqueNickname, setUniqueNickname] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState(null);
    let tmp = {}
    const [arr, setArr] = useState(tmp);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const response = await fetch('/api/fetchUniqueNickname', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const result = await response.json();   
            if (result.result) {
                setResult(result);
                setUniqueNickname(result.data.uniqueNickname);
            }
            setIsLoading(false);
            for (let index = 1; index < 31; index++) {
                tmp[index] = false;
            }
            for (let index = 0; index < result?.data?.generatedNumber?.length; index++) {
                tmp[result?.data?.generatedNumber[index]] = '생성됨';
            }
            setArr(tmp)
        };
        fetchData();
    }, []);
    return (
        <div className="flex justify-center  p-[32px]">

            <div className="w-[800px] bg-orange-100 p-[32px]">
                <h1 className="text-[2.5rem] font-bold">학생 계정 생성😊</h1>
                {isLoading
                    ? <div>loading... </div>
                    : uniqueNickname
                        ? <CreateStudentAccount  result={result.data} studentData={result.studentData} arr={arr} setArr={setArr}/>
                        : <CreateUniqueNickname />}
            </div>
        </div>
    )
}