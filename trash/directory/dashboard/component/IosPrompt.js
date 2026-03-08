

export default function IosPrompt({iosCancelClicked}) {
    console.log("ios prompt")
    return (
        <div role="alert" className="alert flex justify-center absolute bottom-0 left-0 flex-wrap">
            <span >class-reward는 앱에서 원활히 사용할 수 있습니다.&nbsp;
                <svg className="inline-block" fill="none" height="24" strokeWidth="1.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3M12 3L8.5 6.5M12 3L15.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                를 클릭하며 홈 화면에 설치하여 주세요
            </span>
            <div className="flex justify-between">
                <button className="btn btn-sm mr-[16px]" onClick={iosCancelClicked}>다시 보지 않기</button>

            </div>
        </div>
    )

}