export default function ItemBuyCard(props) {
    return (
        <div {...props} className={`w-[160px] rounded-xl h-[200px] p-[16px] m-[16px]  cursor-pointer flex flex-col justify-between bg-orange-200 ${props.checked ? "bg-orange-300" : "bg-white"}`}>
            <div>

                <h1 className="text-[1.2rem] font-bold">{props.itemname}</h1>
                <div className="text-gray-500">{props.itemdetail}</div>
            </div>
            <div className="text-red-500 text-right">{props.currencyEmoji} {props.itemprice} {props.currencyName}</div>
        </div>
    )
}