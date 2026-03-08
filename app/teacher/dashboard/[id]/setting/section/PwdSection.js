import { useState } from "react";


export default function PwdSection({onPwdChange, password, onPwdSubmit, error}) {

        return (
            <div className="flex m-[20px] min-[600px]:p-[20px]  w-[280px] justify-center flex-col">
                <h1 className="text-[2rem]">계정 관리</h1>
                <div>
                    <h2 className="mt-[24px]">현재 비밀번호</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.currentPassword} onChange={onPwdChange} name="currentPassword"/>
                </div>
                <div>
                    <h2 className="mt-[24px]">새로운 비밀번호</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.nextPassword} onChange={onPwdChange} name="nextPassword"/>
                </div>
                <div>
                    <h2 className="mt-[24px]">새로운 비밀번호 확인</h2>
                    <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" value={password.nextPasswordConfirm} onChange={onPwdChange} name="nextPasswordConfirm"/>
                </div>

                <form onSubmit={onPwdSubmit}>
                    <button className="btn block w-[100%] mt-[24px] bg-orange-500 text-white">확인</button>
                </form>
                <div className="text-center text-red-500">{error}</div>
            </div>
        )
    }