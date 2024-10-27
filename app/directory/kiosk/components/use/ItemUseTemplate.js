
import { useState, useEffect } from "react";
import Alert from "../Alert";
import {stepDataState, requestDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";


export default function ItemUseTemplate() {

    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const tmp = JSON.parse(JSON.stringify(requestData)).itemList.map((a) => { a.checked = false; return a })
    for (let index = tmp.length; index < 32; index++) {
        tmp.push({ itemId: null })
    }
    const [isLoading, setIsLoading] = useState(false);
    const [itemList, setItemList] = useState(tmp)
    const [isSelected, setIsSelected] = useState(false);

    const onClick = (a) => {

        if (isSelected === false) {
            setIsSelected(true)
        }

        setRequestData(prev => ({ ...prev, itemData: a }))
        const updatedItems = itemList.map(item => {
            // 대상 사용자를 찾으면 비밀번호를 변경
            if (item.itemId === a.itemId) {
                return { ...item, checked: true };
            } else {
                return { ...item, checked: false }
            }
        });
        console.log(requestData)
        // 업데이트된 사용자 리스트를 상태로 설정
        setItemList(updatedItems);
    }

    let tmpWidth = 0;
    if (window.innerHeight * 1.3 < window.innerWidth) {
        tmpWidth = window.innerHeight * 1.3
    } else {
        tmpWidth = window.innerWidth
    }
    const [width, setWidth] = useState(tmpWidth * 0.01);

    useEffect(() => {
        const handleResize = () => {
            let tmp = 0;
            if (window.innerHeight * 1.3 < window.innerWidth) {
                tmp = window.innerHeight * 1.3
            } else {
                tmp = window.innerWidth
            }
            setWidth(tmp * 0.01)
            console.log(width)
        };

        window.addEventListener('resize', handleResize);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const onSubmit = (e) => {
        const { itemName, itemPrice, itemId} = requestData.itemData;
        const { userName, userId, teacher } = requestData;
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId, teacher: teacher, itemPrice: itemPrice, itemId: itemId, userName: userName}),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    document.getElementById('my_modal_2').showModal()



                } else {
                    setIsLoading(false)
                }
            })
        }

    }
    const onModalFinish = () => {
        location.reload();
    }
    return (
        <div className="flex justify-center items-center h-[100vh] bg-orange-100" style={{ scrollbarWidth: 'auto' }}>
            <div>
                <div className="flex">
                    <button className="mr-[16px] btn" onClick={() => setStepData({ menu: "home", step: null })} >처음으로</button>
                </div>
                <div className="bg-orange-200 rounded-2xl flex justify-center" style={{ height: 50 * width + 'px', padding: 2 * width + 'px' }}>

                    <div className="bg-orange-200" style={{ width: 43 * width + 'px' }}>
                        <h1 className="" style={{ fontSize: 5 * width + 'px', marginLeft: 1.5 * width + 'px' }}>
                            창고
                        </h1>
                        <div className="flex justify-center">
                            <div className="flex flex-wrap overflow-scroll overflow-x-hidden" style={{ height: 38 * width + 'px', width: 45 * width + 'px' }}>
                                {itemList.map((a, i) => {
                                    return (
                                        a.itemId === null || a.state === "대기중"
                                            ? <div key={i} style={{ width: 8 * width + 'px', height: 8 * width + 'px', margin: width * 0.8 + 'px', fontSize: 4 * width }} className="bg-white  flex justify-center items-center  rounded-lg"></div>
                                            : <div onClick={() => onClick(a)} key={i} style={{ width: 8 * width + 'px', height: 8 * width + 'px', margin: width * 0.8 + 'px', fontSize: 4 * width }} className="bg-white  hover:bg-yellow-300    flex justify-center items-center cursor-pointer hover:scale-110  rounded-lg">{a.itemEmoji}</div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-200 flex justify-center items-center" style={{ width: 30 * width + 'px', padding: width + 'px', marginLeft: 5 * width + 'px' }}>

                        {isSelected
                            ? <div className="bg-white  h-[100%] flex flex-col justify-evenly rounded-xl" style={{ width: 30 * width + 'px', padding: width + 'px' }}>
                                <div className="leading-none text-center hover:cursor-default" style={{ fontSize: 20 * width + 'px' }}>{requestData.itemData.itemEmoji}</div>
                                <div>
                                    <h1 className="" style={{ fontSize: 3.5 * width + 'px' }}>{requestData.itemData.itemName}</h1>
                                    <div className="" style={{ fontSize: 1.5 * width + 'px' }}>{requestData.itemData.itemExplanation}</div>
                                </div>
                                <button onClick={onSubmit} className="bg-orange-300 rounded-lg hover:bg-orange-500" style={{ fontSize: 2 * width + 'px', height: 5 * width + 'px' }}>사용하기</button>
                            </div>
                            : <div className="text-center">아이템을 선택하세요</div>}
                    </div>

                </div>
                <Alert onModalFinish={onModalFinish} >아이템 사용을 신청하였습니다</Alert>
            </div>
        </div>
    )
}