import ItemBuyCard from "./ItemBuyCard";

export default function ItemBuyTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData }) {

    const onClick = (a) => {
        console.log(a)
        console.log(requestData)
        if(a.itemPrice>requestData.userMoney){
            alert('돈이 모자랍니다')
            return
        }
        setRequestData(prev => ({ ...prev, requestItemData: a }))
    }
    return (
        <div className="flex flex-col justify-center items-center">
            <button onClick={() => setStep('home')}>처음으로</button>
            <div className="flex flex-wrap">
                {itemData.map((a, i) => {
                    return (
                        <ItemBuyCard onClick={e => onClick(a)} key={i} itemname={a.itemName} itemdetail={a.itemExplanation} itemprice={a.itemPrice} />
                    )
                })}
            </div>
            <button onClick={() => setIsItemPicked(true)}>다음</button>
        </div>
    )
}