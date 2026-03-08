

export default function AndroidPrompt({handleClick, handleCancelClicked}) {
    return (
        <div role="alert" className="alert flex justify-center absolute bottom-0 left-0 flex-wrap">
            <span>class-reward는 앱에서 원활히 사용할 수 있습니다. 설치하시겠습니까?</span>
            <div className="flex justify-between">
                <button className="btn btn-sm mr-[16px]" onClick={handleCancelClicked}>다음에</button>
                <button className="btn btn-sm btn-primary" onClick={handleClick}>홈 화면에 추가</button>
            </div>
        </div>
    )

}