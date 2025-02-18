import { useState, useEffect } from "react";
import { mutate } from "swr";
export default function PickNumber({ classData }) {


    const [isLoading, setIsLoading] = useState(false);
    const [studentArr, setStudentArr] = useState({});
    console.log('classData: ', classData)

    useEffect(() => {
        if (classData?.studentAccount) {
            setStudentArr(JSON.parse(JSON.stringify(classData.studentAccount)));
        }
    }, [classData])


    const onCloseModal = () => {

        document.getElementById('my_modal_2').close();


    }
    const onToggle = (i) => {
        setStudentArr(prev => ({
            ...prev,
            [i]: !studentArr[i]
        }));
    }
    const onSubmit = () => {
        if (isLoading) {
            return
        }
        let accountArr = Object.keys(studentArr).filter((a) => studentArr[a] === true)
        const updatedStudentArr = Object.fromEntries(
            Object.entries(studentArr).map(([key, value]) => [
                key,
                value ? "생성됨" : value
            ])
        );


        setIsLoading(true);
        fetch('/api/createStudentAccount', {
            method: "POST",
            body: JSON.stringify({ accountArr: accountArr, updatedStudentArr: updatedStudentArr, uniqueNickname: classData.uniqueNickname }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                
                mutate("/api/fetchClassData");
                mutate("/api/fetchStudentData");
                alert('성공');
                onCloseModal();
            }
        })
        setIsLoading(false);    

    };



    return (
        <div>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box w-[1000px]">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold  text-[1.5rem] mb-[16px]">계정은 1번부터 30번까지 만들 수 있습니다</h3>
                    </div>
                    {/* 😴😆 */}
                    <div className="grid grid-cols-5">
                        {Object.keys(studentArr).map((a, i) => {
                            return (
                                <div key={i} className="text-center  m-[8px] " >
                                    {studentArr[i + 1] === '생성됨'
                                        ? <div className="text-[3rem] leading-none opacity-50">❤️</div>
                                        : studentArr[i + 1] === true
                                            ? <div className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110" onClick={() => onToggle(i + 1)}>❤️</div>
                                            : <div className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110" onClick={() => onToggle(i + 1)}>😴</div>
                                    }
                                    <div>{i + 1}번</div>
                                </div>
                            )
                        })}
                    </div>
                    <button className="btn w-full bg-orange-300 hover:bg-orange-400 mt-[16px]" onClick={onSubmit}>확인</button>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}