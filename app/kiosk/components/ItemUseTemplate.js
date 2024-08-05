import ItemBuyCard from "./ItemBuyCard";
import { useState, useEffect } from "react";
import Alert from "./Alert";

export default function ItemUseTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData, currencyName }) {
    const tmp = requestData.itemList.map((a) => { a.checked = false; return a })
    for (let index = tmp.length; index < 32; index++) {
        tmp.push({ itemId: null })

    }
    const [isLoading, setIsLoading] = useState(false);
    const { userName, userId, userMoney } = requestData;
    const [itemList, setItemList] = useState(tmp)
    const [isSelected, setIsSelected] = useState(false);
    const [itemDetail, setItemDetail] = useState({ itemName: null, teacher: null, itemPrice: null, itemId: null, itemEmoji: null, itemExplanation: null })
    const onItemClick = (a) => {
        console.log(a)
        setItemDetail({ itemName: a.itemName, itemExplanation: a.itemExplanation, itemEmoji: a.itemEmoji, teacher: a.teacher, itemPrice: a.itemPrice, itemId: a.itemId })
    }
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

        // 업데이트된 사용자 리스트를 상태로 설정
        setItemList(updatedItems);
    }
    const onNext = () => {
        if (isSelected) {
            setIsItemPicked(true)
        } else {
            document.getElementById('my_modal_2').showModal();
        }
    }
    const onModalClick = () => {
        document.getElementById('my_modal_2').close();
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
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemDetail.itemName, userId: userId, teacher: itemDetail.teacher, itemPrice: itemDetail.itemPrice, itemId: itemDetail.itemId, userName: userName }),
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
    return (
        <div className="flex justify-center items-center h-[100vh] bg-orange-100" style={{ scrollbarWidth: 'auto' }}>

            {/* <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
            <div className="flex flex-wrap">
                {itemList.map((a, i) => {
                    return (
                        a.state === "사용 가능"
                        ? <ItemBuyCard onClick={e => onClick(a)} currencyname={currencyName} key={i} itemname={a.itemName} itemexplanation={a.itemExplanation} itemprice={a.itemPrice} checked={a.checked}/>
                        : null
                        )
                })}
            </div>

            <Alert setStep={onModalClick}>아이템을 선택해주세요</Alert> */}
            <div>
                <div className="flex">
                    <button className="mr-[16px] btn" onClick={() => setStep('home')} >처음으로</button>
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
                                            : <div onClick={() => onItemClick(a)} key={i} style={{ width: 8 * width + 'px', height: 8 * width + 'px', margin: width * 0.8 + 'px', fontSize: 4 * width }} className="bg-white  hover:bg-yellow-300    flex justify-center items-center cursor-pointer hover:scale-110  rounded-lg">{a.itemEmoji}</div>
                                    )
                                })}


                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-200 flex justify-center items-center" style={{ width: 30 * width + 'px', padding: width + 'px', marginLeft: 5 * width + 'px' }}>

                        {itemDetail.itemName
                            ? <div className="bg-white  h-[100%] flex flex-col justify-evenly rounded-xl" style={{ width: 30 * width + 'px', padding: width + 'px' }}>
                                <div className="leading-none text-center hover:cursor-default" style={{ fontSize: 20 * width + 'px' }}>{itemDetail.itemEmoji}</div>
                                <div>
                                    <h1 className="" style={{ fontSize: 3.5 * width + 'px' }}>{itemDetail.itemName}</h1>
                                    <div className="" style={{ fontSize: 1.5 * width + 'px' }}>{itemDetail.itemExplanation}</div>
                                </div>
                                <button onClick={onSubmit} className="bg-orange-300 rounded-lg hover:bg-orange-500" style={{ fontSize: 2 * width + 'px', height: 5 * width + 'px' }}>사용하기</button>
                            </div>
                            : <div className="text-center">아이템을 선택하세요</div>}
                    </div>

                </div>
                <Alert setStep={setStep} >아이템 사용을 신청하였습니다</Alert>
            </div>
        </div>
    )
}