import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import DialBtn from "./DialBtn";
import { mutate } from "swr";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
// 지급/회수 금액 키패드 창 (열려 있을 때만 키보드 숫자를 받는다)
export default function Modal({ modalId, setModalId, ...props }) {
    return (
        <ModalTemplate id="POINT" modalId={modalId} setModalId={setModalId} className="w-[320px] max-w-[95vw] overflow-hidden">
            {({ close }) => <PointKeypad {...props} close={close} />}
        </ModalTemplate>
    );
}

function PointKeypad({ studentArr, currencyName, targetStudent, clearAll, isSend, setStudentArr, classId, close }) {
    const [point, setPoint] = useState(null);
    const [fontSize, setFontSize] = useState(1.7);
    const [activeKey, setActiveKey] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const onClick = (e) => {
        if (point === null) {
            setPoint(e.target.value.toString())
        } else {
            setPoint(prev => prev + e.target.value.toString())
        }
    }
    const onBackspace = () => {
        if (point) {
            setPoint(prev => prev.slice(0, -1))
        }

    }
    const modalClose = () => {
        setPoint(null)
        setFontSize(1.7)
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        if (point === null || point === '') {
            toast.error('숫자를 입력해주세요')
            return;
        }
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            // 서버 쪽 권한/검증 로직(server action)만 신뢰: 학생 목록은 userId/money만 최소로 전달
            const payload = targetStudent.map((s) => ({ userId: s.userId, money: s.money }));
            const res = await handlePoint({ classId, targetStudent: payload, point, isSend });

            if (!res?.result) {
                throw new Error(res?.message || '처리 중 오류가 발생했습니다.');
            }

            const message = targetStudent.map((a, i) => a.userId)
            if (isSend) {
                toast.success(message + '에게 ' + point + currencyName + '를(을) 지급하였습니다.');
            } else {
                toast.success(message + '에게서 ' + point + currencyName + '를(을) 회수하였습니다.');
            }

            clearAll();
            const activeIds = targetStudent.map(student => student._id);
            const updatedStudentArr = studentArr.map(student => {
                if (activeIds.includes(student._id)) {
                    const updatedMoney = isSend ? Number(student.money) + Number(point) : Number(student.money) - Number(point)
                    return {
                        ...student,
                        money: updatedMoney,// 원하는 만큼 증가
                        isactive: false
                    };
                } else {
                    return student;
                }
            });
            setStudentArr(updatedStudentArr)

            mutate(
                `/api/students/${classId}`,
                (prev) => {
                    if (!prev) return prev;

                    return prev.map(student => {
                        if (activeIds.includes(student._id)) {
                            const updatedMoney = isSend ? Number(student.money) + Number(point) : Number(student.money) - Number(point)
                            return {
                                ...student,
                                money: updatedMoney// 원하는 만큼 증가
                            };
                        }
                        return student;
                    });
                },
                false // 서버 요청 없이 즉시 반영
            );

            modalClose();
            close();
        } catch (error) {
            toast.error(error.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }


    const handleKeyDown = (e) => {
        const allowedKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'Enter', 'Backspace', 'Delete'
        ];

        if (!allowedKeys.includes(e.key)) {
            return;
        }

        if (e.key === 'Enter') {
            return;
        } else if (e.key === 'Backspace') {
            if (point) {
                setPoint(prev => prev.slice(0, -1))
                setFontSize(Math.min(1.7, Math.max(12 / point.length, fontSize)))
            }
        } else {
            if (point === null) {
                setPoint(e.key.toString())
            } else {
                setPoint(prev => prev + e.key.toString())
            }
        }

        if (e.key >= '0' && e.key <= '9' || e.key === 'Backspace' || e.key === 'Enter') {
            setActiveKey(e.key);
        }
    };

    const handleKeyUp = () => {
        setActiveKey(null);
    };

    useEffect(() => {
        if (point) {
            setFontSize(Math.min(12 / point.length, fontSize))
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [point]);
    return (
            <div className={`w-[320px] max-w-full rounded-2xl p-6 flex justify-center dark:bg-gray-400 ${isSend ? "bg-green-500" : "bg-red-500"}`} >
                <div className="w-[272px]">
                    <h3 className="font-bold text-lg mb-5 ml-[10px] ">
                        {isSend ? "받는" : "잃는"} 사람: {targetStudent.map((a, i) => <span className="text-[1.4rem] ml-[4px]" key={i}><span className="bg-orange-200">{a.userId}</span><span className="">{i < targetStudent.length - 1 && ', '}</span></span>)}
                    </h3>
                    <div className="h-[64px] bg-gray-200 mb-5 rounded-2xl flex justify-between items-center px-[16px]">
                        <div className="text-gray-500">{isSend ? "받는" : "잃는"} 금액</div>
                        <div style={{ fontSize: fontSize + "rem" }} className={` w-[170px] break-all flex justify-end`}>{point ? point : 0} {currencyName}</div>
                    </div>
                    <ul className="flex justify-between">
                        <DialBtn value={'1'} onClick={onClick} isactive={activeKey === "1" ? 1 : 0}>1</DialBtn>
                        <DialBtn value={'2'} onClick={onClick} isactive={activeKey === "2" ? 1 : 0}>2</DialBtn>
                        <DialBtn value={'3'} onClick={onClick} isactive={activeKey === "3" ? 1 : 0}>3</DialBtn>
                    </ul>
                    <ul className="flex justify-between">
                        <DialBtn value={'4'} onClick={onClick} isactive={activeKey === "4" ? 1 : 0}>4</DialBtn>
                        <DialBtn value={'5'} onClick={onClick} isactive={activeKey === "5" ? 1 : 0}>5</DialBtn>
                        <DialBtn value={'6'} onClick={onClick} isactive={activeKey === "6" ? 1 : 0}>6</DialBtn>
                    </ul>
                    <ul className="flex justify-between">
                        <DialBtn value={'7'} onClick={onClick} isactive={activeKey === "7" ? 1 : 0}>7</DialBtn>
                        <DialBtn value={'8'} onClick={onClick} isactive={activeKey === "8" ? 1 : 0}>8</DialBtn>
                        <DialBtn value={'9'} onClick={onClick} isactive={activeKey === "9" ? 1 : 0}>9</DialBtn>
                    </ul>
                    <ul className="flex justify-between">
                        <DialBtn isactive={activeKey === "Backspace" ? 1 : 0}><div className="w-[32px] h-[32px]" onClick={onBackspace} ><svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m22 6.002c0-.552-.448-1-1-1h-12.628c-.437 0-.853.191-1.138.523-1.078 1.256-3.811 4.439-4.993 5.816-.16.187-.241.418-.241.65s.08.464.24.651c1.181 1.38 3.915 4.575 4.994 5.836.285.333.701.524 1.14.524h12.626c.552 0 1-.447 1-1 0-2.577 0-9.423 0-12zm-7.991 4.928 1.71-1.711c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .194-.073.385-.219.532l-1.711 1.71 1.728 1.728c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.384-.073-.531-.219l-1.728-1.728-1.728 1.728c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l1.728-1.728-1.788-1.787c-.146-.147-.219-.338-.219-.531 0-.426.346-.75.751-.75.192 0 .384.073.53.219z" fillRule="nonzero" /></svg></div></DialBtn>
                        <DialBtn value={'0'} onClick={onClick} isactive={activeKey === "0" ? 1 : 0}>0</DialBtn>
                        <form onSubmit={onSubmit}>
                            <DialBtn color={'red'} isactive={activeKey === "Enter" ? 1 : 0}><button type="submit" disabled={isLoading} className="outline-0 disabled:opacity-50">{isLoading ? "처리중" : "입력"}</button></DialBtn>
                        </form>
                    </ul>
                </div>
            </div>

    )
}