export default function ItemCard(props) {
    // console.log(props.data)
    const {data} = props;
    console.log(data.emoji)
    return(
        <div className="p-[16px] w-[192px]">
            {/* <div className="flex justify-end">
                <div>남은수량: {data.itemQuantity}</div>
            </div> */}
            <div className="text-[10rem] leading-none">
                {data.emoji}
            </div>
            <div className="text-[2rem] mt-[16px]">
                {data.itemName}
            </div>
            <div className="text-gray-500">
                {data.itemExplanation}
            </div>
            <div className="text-[1.5rem] text-red-500 text-end mt-[16px]">
                {data.itemPrice}<span className="ml-[4px]">{props.currencyName}</span>
            </div>
        </div>
    )
}