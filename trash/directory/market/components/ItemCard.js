import soldOut from "@/public/soldOut.png"
import Image from "next/image";
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
    const truncateText = (text, maxLength) => {
        if (getByteB(text) > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };

    return (
        <div className={`p-[16px] w-[192px] h-[300px] font-bold rounded-lg relative`} onClick={() => props.onClick(data)}>
            {data.itemStock <= 0
                ? <div className="absolute z-50 top-[60px]" >
                    <Image src={soldOut} alt="soldout"/>
                </div>
                : null}
            <div className={`${data.itemStock <= 0 ? "opacity-30" : null}`}>
                <div className="text-[130px] text-center leading-none">
                    {data.emoji}
                </div>
                <div className="text-[1.5rem]  mt-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {data.itemName}
                </div>
                <div className="text-gray-500 h-[48px]">
                    {truncateText(data.itemExplanation, 26)}
                </div>
                <div className="text-[1.5rem] text-red-500 text-end mt-[16px] absolute bottom-2 right-3">
                    {data.itemPrice}<span className="ml-[4px]">{props.currencyName}</span>
                </div>
            </div>
        </div>
    )
}