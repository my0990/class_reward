import { useState, useEffect } from "react";
import DialBtn from "./DialBtn";
export default function Modal({  isSend, currencyName, targetStudent }) {
    const [point, setPoint] = useState(null);
    const [fontSize, setFontSize] = useState(1.7);
    const [activeKey, setActiveKey] = useState(null);
    const [isLoading,setIsLoading] = useState(false);

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
    const onSubmit = (e) => {
        e.preventDefault();

        if (point === null || point === '') {
            alert('숫자를 입력해주세요')
            return;
        }
        if(isLoading === true){
            return
        } else {
            setIsLoading(true)
            fetch("/api/handlePoint", {
                method: "POST",
                body: JSON.stringify({ targetStudent: targetStudent, point: point, isSend: isSend }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    const message = targetStudent.map((a,i)=> a.userId)
                    if(isSend){
                        alert(message+ '에게 ' + point + currencyName + '를(을) 지급하였습니다.');
                        location.reload();
                    } else {
                        alert(message+ '에게서 ' + point + currencyName + '를(을) 회수하였습니다.');
                        location.reload();
                    }
                    setIsLoading(false)
    
                }
            })
        }
        
    }

    const modalClose = () => {
        setPoint(null)
        setFontSize(1.7)
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
        <dialog id="modal" className="modal " tabIndex="-1">
            <div className={`modal-box w-[320px] flex justify-center dark:bg-gray-400 ${isSend ? "bg-green-500" : "bg-red-500"}`} >
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
                            <DialBtn color={'red'} isactive={activeKey === "Enter" ? 1 : 0}><button className="outline-0">입력</button></DialBtn>
                        </form>
                    </ul>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" >
                <button onClick={() => setTimeout(modalClose, 200)}>close</button>
            </form>
        </dialog>
    )
}