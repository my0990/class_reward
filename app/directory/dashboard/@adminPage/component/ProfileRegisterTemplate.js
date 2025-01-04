'use client'

import { useState } from "react"

export default function ProfileRegisterTemplate({ urlObj }) {
    const [url, setUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const onChange = (e) => {
        setUrl(e.target.value)
    }
    const onSubmit = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/registerProfileImg", {
                method: "POST",
                body: JSON.stringify({ profileUrl: url, urlId: Object.keys(urlObj).length }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    location.reload();

                } else {
                    alert('오류 발생')
                }
                setIsLoading(false)
            },
            )
        }
    }
    return (
        <div>
            <h1 className="text-[2rem] w-[700px] mb-[8px]">admin page</h1>
            <label for="profileUrlInput">프로필 이미지 링크 입력</label>
            <div className="flex">
                <input onChange={onChange} value={url} className="border-2 mr-[16px]" id="profileUrlInput"></input>
                <button className="btn" onClick={onSubmit}>확인</button>
            </div>
            <div className="flex mt-[32px] justify-content flex-wrap">
                {Object.keys(urlObj).map((a, i) => {
                    return (
                        <div className="m-[8px]" key={i}>
                            <img src={urlObj[a].url} width={200} height={200} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}