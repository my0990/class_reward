export default function DashboardBtns({handleToggleAll, studentsData, isSelectedAll, onSend, hasSelectedStudent, onTake, currencyName}){
    return(
        <div className="flex py-[16px] mr-[8px] justify-between">
        <button
          className="btn bg-orange-500 text-white ml-[8px]"
          onClick={handleToggleAll}
          disabled={studentsData.length === 0}
        >
          {isSelectedAll ? '모두 해제' : '모두 선택'}
        </button>

        <div>
          <button
            className="btn btn-success text-white mr-[16px]"
            onClick={onSend}
            disabled={!hasSelectedStudent}
          >
            {currencyName} 보내기
          </button>

          <button
            className="btn bg-red-500 text-white"
            onClick={onTake}
            disabled={!hasSelectedStudent}
          >
            {currencyName} 빼앗기
          </button>
        </div>
      </div>
    )
}