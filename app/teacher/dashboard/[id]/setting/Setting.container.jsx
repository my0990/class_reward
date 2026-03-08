'use client'

import ProfileSection from "./section/ProfileSection";
import { useState, useEffect } from "react"
import useMultiFetch from "@/hooks/useMultiFetch";
import { useParams } from "next/navigation";
import ProfileImgSettingModal from "./section/ProfileImgSettingModal";
import usePendingAction from "@/hooks/usePendingAction";
import { toast, Toaster } from "react-hot-toast";
import PwdSection from "./section/PwdSection";
import ClassSection from "./section/ClassSection";
export default function SettingContainer() {
    const params = useParams();
    const classId = params.id;

    const [tab, setTab] = useState('profile');
    const { runAction, isPending } = usePendingAction();

    const [password, setPassword] = useState({ currentPassword: '', nextPassword: '', nextPasswordConfirm: '' })
    const [error, setError] = useState(null);

    const { data = {}, isLoading, isError, results } = useMultiFetch([
        { key: "classData", url: `/api/classData/${classId}` },
        { key: "studentsData", url: `/api/students/${classId}` },
        { key: "userData", url: '/api/user' },
    ]);


    const [formData, setFormData] = useState({
        profileNickname: "",
        profileState: "",
        profileUrl: "",
    });
    const [currencyData, setCurrencyData] = useState({
        currencyName: "",
        currencyEmoji: ""
    });
    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        runAction("editProfile", async () => {
            const res = await fetch("/api/profileEdit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok || !data.result) {
                throw new Error(data.message || "프로필 수정에 실패했습니다.");
            } else {
                results.userData.mutate()
                toast.success("프로필을 수정하였습니다")
            }
        })
    };

    // password

    const onPwdChange = (e) => {
        const { name, value } = e.target;
        setPassword({ ...password, [name]: value })
    }
    const onPwdSubmit = (e) => {
        e.preventDefault();

        if (password.currentPassword === '' || password.nextPassword === '' || password.nextPasswordConfirm === '') {
            setError('비밀번호를 모두 입력해주세요')
            return
        }
        if (password.nextPassword !== password.nextPasswordConfirm) {
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
                toast.success('비밀번호를 변경하였습니다')
                setError('')
                setPassword({ currentPassword: '', nextPassword: '', nextPasswordConfirm: '' })

            } else {
                setError('비밀번호가 일치하지 않습니다.')
            }
        })
    }
    const onCurrencyChange = (e) => {
        const { name, value } = e.target;
        setCurrencyData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const onCurrencySubmit = (e) => {
        e.preventDefault();
        fetch("/api/setCurrencyName", {
            method: "POST",
            body: JSON.stringify({ data: currencyData, classId: classId }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                results.classData.mutate();
                toast.success('화폐 설정을 변경하였습니다')
            }
        })
    }
    if (isLoading) return <div>불러오는 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    const { profileNickname, profileState, profileUrl } = data.userData;
    const { currencyEmoji, currencyName } = data.classData;

    return (
        <div className="flex ">
            <div className="flex flex-wrap justify-center ">
                <div className="w-[160px] m-[20px] min-[600px]:m-[40px] min-[602px]:border-r-2 max-[601px]:border-b-2 max-[601px]:w-[280px] max-[601px]:justify-center">
                    <h1 className={`text-[1.5rem] font-bold`}>설정</h1>
                    <h2 onClick={() => setTab("profile")} id="profile" className={`cursor-pointer text-[1.1rem] mt-[32px]`}><span className={`${tab === "profile" ? "border-b-4 border-orange-500" : null}`}>프로필 관리</span></h2>
                    <h2 onClick={() => setTab("pwd")} id="pwd" className={`cursor-pointer text-[1.1rem] mt-[16px] max-[600px]:mb-[40px] `}><span className={`${tab === "pwd" ? "border-b-4 border-orange-500" : null}`}>계정 관리</span></h2>
                    <h2 onClick={() => setTab("class")} id="class" className={`cursor-pointer text-[1.1rem] mt-[16px] max-[600px]:mb-[40px] `}><span className={`${tab === "class" ? "border-b-4 border-orange-500" : null}`}>학급 관리</span></h2>
                </div>
                <div className="max-[600px]:w-[100%] flex justify-center">
                    {tab === "profile" ? <ProfileSection {...{ profileNickname, profileState, profileUrl, setFormData, onSubmit, formData, onChange, isPending }} />
                        : tab === "pwd" ? <PwdSection {...{ onPwdChange, password, onPwdSubmit, error }} />
                            : <ClassSection {...{ currencyEmoji, currencyName, currencyData, setCurrencyData, onCurrencyChange, onCurrencySubmit }} />}
                </div>
            </div>
            {/* <ProfileImgSettingModal /> */}
            <Toaster position="bottom-right" />
        </div>
    )
}