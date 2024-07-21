export default function ItemCard(props) {
    // console.log(props.data)
    const { data } = props;
    function getByteB(str) {
        let byte = 0;
        for (let i = 0; i < str.length; ++i) {
            // 기본 한글 2바이트 처리
            str.charCodeAt(i) > 127 ? (byte += 2) : byte++;
        }
        return byte;
    }
    const text = data.itemExplanation
    const truncateText = (text, maxLength) => {
        if (getByteB(text) > maxLength) {
          return text.slice(0, maxLength) + '...';
        }
        return text;
      };
    
    return (
        <div className="p-[16px] w-[192px] cursor-pointer font-bold rounded-lg" onClick={() => props.onClick(data)}>
            {/* <div className="flex justify-end">
                <div>남은수량: {data.itemQuantity}</div>
            </div> */}
            <div className="text-[10rem] leading-none">
                {data.emoji}
            </div>
            <div className="text-[1.5rem]  mt-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                {data.itemName}
            </div>
            <div className="text-gray-500 h-[48px]">
                {truncateText(data.itemExplanation,26)}

            </div>
            <div className="text-[1.5rem] text-red-500 text-end mt-[16px]">
                {data.itemPrice}<span className="ml-[4px]">{props.currencyName}</span>
            </div>
        </div>
    )
}