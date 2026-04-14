export default function RewardBox({ degree, side = 'right', children }) {
    return (
      <div
        className={`absolute flex items-center -translate-y-1/2 cursor-pointer hover:scale-110 transition-all ${
          side === 'left' ? 'right-[100px] flex-row-reverse' : 'left-[100px]'
        }`}
        style={{ bottom: 95 + degree * 3.1}}
      >
        <div className="w-8 border-t-2 border-dashed border-orange-300" />
        <div className="rounded-md bg-orange-100 opacity-50 hover:opacity-100 px-2.5 py-4 text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap">
          <span className="mr-1 font-semibold text-orange-600">{degree}도</span>
          {children}
        </div>
      </div>
    );
  }