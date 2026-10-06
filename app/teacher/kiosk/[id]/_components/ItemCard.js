// 키오스크 아이템 카드 / 아이템 목록 / 고른 아이템 상세
import Image from "next/image";
import soldOut from "@/public/soldOut.png";

/** 구매 화면은 showStock=true (재고·품절 표시, 품절이면 못 누름) */
export default function ItemCard({ item, currencyName, showStock = false, onClick }) {
  const { itemStock, itemName, itemExplanation, itemPrice, emoji } = item;
  const isSoldOut = showStock && itemStock <= 0;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={onClick}
      className={`relative h-[300px] w-[192px] rounded-lg bg-orange-200 p-[16px] text-left font-bold shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] ${
        isSoldOut ? "cursor-default" : "transition-all hover:scale-110"
      }`}
    >
      {isSoldOut && (
        <div className="absolute left-0 top-[50px] z-10">
          <Image src={soldOut} alt="품절" />
        </div>
      )}
      <div className={isSoldOut ? "opacity-40" : ""}>
        {showStock && (
          <div className={`text-right ${itemStock <= 3 ? "text-red-500" : ""}`}>남은수량: {itemStock}</div>
        )}
        <div className="text-center text-[130px] leading-none">{emoji}</div>
        <div className="mt-[16px] truncate text-[1.5rem]">{itemName}</div>
        <div className="line-clamp-2 h-[48px] text-gray-500">{itemExplanation}</div>
        <div className="absolute bottom-2 right-3 text-[1.5rem] text-red-500">
          {itemPrice}
          <span className="ml-[4px]">{currencyName}</span>
        </div>
      </div>
    </button>
  );
}

export function ItemGrid({ items = [], currencyName, showStock, onPick }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,192px)] justify-center gap-8">
      {items.map((item) => (
        <ItemCard
          key={item.itemId ?? item.itemName}
          item={item}
          currencyName={currencyName}
          showStock={showStock}
          onClick={() => onPick(item)}
        />
      ))}
    </div>
  );
}

/** 고른 아이템 크게 보기 (구매 학생 선택·결제 화면) */
export function ItemDetail({ item, currencyName }) {
  const { emoji, itemName, itemExplanation, itemStock, itemPrice } = item;
  return (
    <div className="mt-[8px] flex rounded-xl bg-orange-100 p-[32px]">
      <div className="mr-[32px] text-center text-[136px] leading-none">{emoji}</div>
      <div className="min-w-0">
        <div className="truncate text-[1.6rem]">{itemName}</div>
        <div className="mb-[8px] text-[1.4rem] text-gray-500">{itemExplanation}</div>
        <div className="text-[1.2rem]">남은수량: {itemStock}</div>
        <div className="mt-[8px] text-[1.5rem] text-red-500">
          {itemPrice}
          <span className="ml-[4px]">{currencyName}</span>
        </div>
      </div>
    </div>
  );
}
