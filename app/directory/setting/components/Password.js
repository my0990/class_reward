import { useState } from "react";


export default function Password() {
    const [password,setPassword] = useState({currentPassword: '', nextPassword: '', nextPasswordConfirm: ''})
    const [error,setError] = useState(null);
    const onChange= (e) => {
        const {name, value} = e.target;
        setPassword({...password, [name]: value})
    }
    const onSubmit = (e) => {
        e.preventDefault();

        if(password.currentPassword === '' || password.nextPassword === '' || password.nextPasswordConfirm === ''){
            setError('비밀번호를 모두 입력해주세요')
            return
        }
        if(password.nextPassword !== password.nextPasswordConfirm){
            setError('비밀번호를 확인해주세요')
            return
        }
        fetch("/api/passwordEdit", {
            method: "POST",
            body: JSON.stringify(password),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('수정하였습니다')
                setError('')
                setPassword({currentPassword: '', nextPassword: '', nextPasswordConfirm: ''})

            } else {
                setError('비밀번호가 일치하지 않습니다.')
            }
        })}
        return (
            <div className="flex m-[20px] min-[600px]:p-[20px]  w-[280px] justify-center flex-col">
                <h1 className="text-[2rem]">계정 관리</h1>
                <div>
                    <h2 className="mt-[24px]">현재 비밀번호</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.currentPassword} onChange={onChange} name="currentPassword"/>
                </div>
                <div>
                    <h2 className="mt-[24px]">새로운 비밀번호</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.nextPassword} onChange={onChange} name="nextPassword"/>
                </div>
                <div>
                    <h2 className="mt-[24px]">새로운 비밀번호 확인</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.nextPasswordConfirm} onChange={onChange} name="nextPasswordConfirm"/>
                </div>

                <form onSubmit={onSubmit}>
                    <button className="btn block w-[100%] mt-[24px] bg-orange-500 text-white">확인</button>
                </form>
                <div className="text-center text-red-500">{error}</div>
            </div>
        )
    }