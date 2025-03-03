'use client'
import { useState, useEffect } from "react";
import { fetchData } from "@/hooks/swrHooks";
import { mutate } from "swr";


export default function ItemUseTemplate({ }) {
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');
    const [itemList, setItemList] = useState([])
    
    useEffect(() => {
        if (userData) {


            const tmp = userData.itemList.map((a) => {
                const acopy = { ...a }
                { acopy.checked = false; return acopy }
            })
            for (let index = tmp.length; index < 32; index++) {
                tmp.push({ itemId: null })

            }
            setItemList(tmp)
        }
    }, [userData])

    const [isLoading, setIsLoading] = useState(false);


    const [isSelected, setIsSelected] = useState(false);
    const [itemDetail, setItemDetail] = useState({ itemName: null,  itemPrice: null, itemId: null, itemEmoji: null, itemExplanation: null })
    const onItemClick = (a) => {
        setItemDetail({ itemName: a.itemName, itemExplanation: a.itemExplanation, itemEmoji: a.itemEmoji, teacher: a.teacher, itemPrice: a.itemPrice, itemId: a.itemId })
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
            
            if(typeof window === "undefined"){
                return
            }
            if (window.innerHeight * 1.3 < window.innerWidth) {
                tmp = window.innerHeight * 1.3
            } else {
                tmp = window.innerWidth
            }
            setWidth(tmp * 0.01)

        };
        if (typeof window !== "undefined") {
            window.addEventListener('resize', handleResize);
        }
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
                // itemName, userId, itemId, balance
                body: JSON.stringify({ itemName: itemDetail.itemName, userId: userId,  itemId: itemDetail.itemId, balance: money }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    mutate('/api/fetchUserData');
                    alert(`${itemDetail.itemName} 아이템을 사용하였습니다`);
                    setItemDetail({itemName: null,  itemPrice: null, itemId: null, itemEmoji: null, itemExplanation: null});
                    
                } 
                    setIsLoading(false)

            })
        }

    }

    if (isUserLoading) return <div>Loading data...</div>;
    if (isUserError) return <div>Error loading data</div>;
    const { userId, money } = userData;

    return (
        <div className="flex justify-center items-center h-[100vh] bg-orange-100" style={{ scrollbarWidth: 'auto' }}>
            <div>
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
            </div>
        </div>
    )
}

