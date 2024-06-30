export default function ItemBuyCard(props) {
    return (
        <div {...props} className="w-[160px] h-[200px] p-[16px] m-[16px] bg-white cursor-pointer flex flex-col justify-between">
            <div>
                <h1 className="text-[1.2rem] font-bold">{props.itemname}</h1>
                <div className="text-gray-500">{props.itemdetail}</div>
            </div>
            <div className="text-red-500 text-right">{props.itemprice}</div>
        </div>
    )
}