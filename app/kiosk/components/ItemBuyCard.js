export default function ItemBuyCard(props) {

    function getByteB(str) {
        let byte = 0;
        for (let i = 0; i < str?.length; ++i) {
            // 기본 한글 2바이트 처리
            str.charCodeAt(i) > 127 ? (byte += 2) : byte++;
        }
        return byte;
    }
    const text = props.itemExplanation
    const truncateText = (text, maxLength) => {
        if (getByteB(text) > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };
    return (
        // <div {...props} className={`w-[160px] rounded-xl h-[200px] p-[16px] m-[16px]  cursor-pointer flex flex-col justify-between bg-orange-200 ${props.checked ? "bg-orange-300" : "bg-white"}`}>
        //     <div>

        //         <h1 className="text-[1.2rem] font-bold">{props.itemname}</h1>
        //         <div className="text-gray-500">{props.itemdetail}</div>
        //     </div>
        //     <div className="text-red-500 text-right">{props.currencyEmoji} {props.itemprice} {props.currencyName}</div>
        // </div>
        <div {...props} className={` p-[16px] w-[192px] h-[300px] cursor-pointer font-bold rounded-lg relative ${props.checked ? "bg-orange-300" : "bg-white"}`}>
            {/* <div className="flex justify-end">
            <div>남은수량: {data.itemQuantity}</div>
        </div> */}
            <div className="text-[130px] text-center leading-none">
                {props.emoji}
            </div>
            <div className="text-[1.5rem]  mt-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                {props.itemname}
            </div>
            <div className="text-gray-500 h-[48px]">
                {truncateText(props.itemexplanation, 26)}

            </div>
            <div className="text-[1.5rem] text-red-500 text-end mt-[16px] absolute bottom-2 right-3">
                {props.itemprice}<span className="ml-[4px]">{props.currencyname}</span>
            </div>
        </div>
    )
}