import soldOut from "@/public/soldOut.png"
import Image from "next/image";
export default function ItemBuyCard({onClick, itemData}) {
    const { itemName, itemExplanation,itemPrice,  emoji, currencyName} = itemData;
    function getByteB(str) {
        let byte = 0;
        for (let i = 0; i < str?.length; ++i) {
            // 기본 한글 2바이트 처리
            str.charCodeAt(i) > 127 ? (byte += 2) : byte++;
        }
        return byte;
    }

    const truncateText = (text, maxLength) => {
        if (getByteB(text) > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };
    return (
        <div onClick={onClick} className=" p-[16px] w-[192px] h-[300px]  font-bold rounded-lg relative">

            <div>
                <div className="text-[130px] text-center leading-none">
                    {emoji}
                </div>
                <div className="text-[1.5rem]  mt-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {itemName}
                </div>
                <div className="text-gray-500 h-[48px]">
                    {truncateText(itemExplanation, 26)}

                </div>
                <div className="text-[1.5rem] text-red-500 text-end mt-[16px] absolute bottom-2 right-3">
                    {itemPrice}<span className="ml-[4px]">{currencyName}</span>
                </div>
            </div>
        </div>
    )
}