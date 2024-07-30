import ItemBuyCard from "./ItemBuyCard";
import { useState, useEffect } from "react";
import Alert from "./Alert";

export default function ItemUseTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData, currencyName }) {
    const tmp = requestData.itemList.map((a) => { a.checked = false; return a })
    const [itemList, setItemList] = useState(tmp)
    const [isSelected, setIsSelected] = useState(false);
    let test = 30;
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
    if (window.innerHeight * 1.3 < window.innerWidth ) {
        tmpWidth = window.innerHeight * 1.3
    } else {
        tmpWidth = window.innerWidth
    }
    const [width, setWidth] = useState(tmpWidth * 0.01);

    useEffect(() => {
        const handleResize = () => {
            let tmp = 0;
            if (window.innerHeight  * 1.3 < window.innerWidth ) {
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
    return (
        <div className="flex justify-center items-center h-[100vh] bg-orange-100">

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
            <div className="flex">
                <button className="mr-[16px] btn" onClick={() => setStep('home')} >처음으로</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
            <Alert setStep={onModalClick}>아이템을 선택해주세요</Alert> */}

            <div className="bg-orange-200 rounded-2xl flex justify-center" style={{width: 90 * width + 'px', height: 50* width + 'px', padding: width + 'px'}}>
                <div className="bg-orange-200" style={{ width: 45 * width + 'px'}}>
                    <h1 className="" style={{fontSize: 5 * width + 'px'}}>
                        창고
                    </h1>
                    <div className="flex justify-center">
                        <div className="flex flex-wrap overflow-scroll overflow-x-hidden" style={{height: 38 * width + 'px', width:  45 * width + 'px'}}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1].map((a, i) => {
                                return (
                                    <div key ={i} style={{width: 8* width + 'px', height: 8* width + 'px', margin: width * 0.8 + 'px', fontSize: 3 * width }} className="bg-white  hover:bg-yellow-300    flex justify-center items-center cursor-pointer hover:scale-110  rounded-lg">🍪</div>
                                )
                            })}


                        </div>
                    </div>
                </div>
                <div className="bg-orange-200 flex justify-center items-center" style={{width: 40* width + 'px', padding: width + 'px'}}>
                    <div className="bg-white  h-[100%] flex flex-col justify-evenly rounded-xl" style={{padding: width + 'px'}}>
                        <div className="leading-none text-center" style={{fontSize: 20 * width + 'px'}}>🍪</div>
                        <div>
                            <h1 className="" style={{fontSize: 2.5 * width + 'px'}}>쿠키</h1>
                            <div className="" style={{fontSize: width + 'px'}}>식사는 없어~~ 배고파도 음료도 없어~~ 목말라도</div>
                        </div>
                        <button className="btn" style={{fontSize: 2 * width + 'px'}}>사용하기</button>
                    </div>
                </div>
            </div>
        </div>
    )
}