'use client'

import ProfileSection from "./components/ProfileSection";
import { useState, useEffect } from "react"
import { useFetchData } from "@/hooks/useFetchData";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import usePendingAction from "@/hooks/usePendingAction";
import { toast } from "react-hot-toast";
import PwdSection from "./components/PwdSection";
import { updateProfile, updatePassword } from "@/server-action/actions/setting/setting.action";
import { updateCurrencyName } from "@/server-action/actions/class/classSetting.action";
import ClassSection from "./components/ClassSection";
import WithdrawModal from "@/components/teacher/WithdrawModal";
export default function SettingContainer() {
    const params = useParams();
    const classId = params.id;

    const [tab, setTab] = useState('profile');
    const [modalId, setModalId] = useState(null);
    const { runAction, isPending } = usePendingAction();

    const [password, setPassword] = useState({ currentPassword: '', nextPassword: '', nextPasswordConfirm: '' })
    const [error, setError] = useState(null);

    const {
        data: classData,
        isLoading: isClassLoading,
        isError: isClassError,
        error: classError,
        mutate: mutateClassData,
      } = useFetchData(classId ? `/api/classData/${classId}` : null);
    
      const {
        data: studentsData = [],
        isLoading: isStudentsLoading,
        isError: isStudentsError,
        error: studentsError,
        mutate: mutateStudentsData,
      } = useFetchData(classId ? `/api/students/${classId}` : null);
    
      const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
        error: userError,
        mutate: mutateUserData,
      } = useFetchData(`/api/user`);

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
            const data = await updateProfile(formData);
            if (!data?.result) {
                throw new Error(data?.message || "프로필 수정에 실패했습니다.");
            } else {
                mutateUserData();
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
        runAction("changePassword", async () => {
            const data = await updatePassword(password);

            if (data?.result === true) {
                // 비밀번호를 바꾸면 모든 기기에서 로그아웃된다 → 이 기기도 새 비밀번호로 다시 로그인
                alert('비밀번호를 변경하였습니다. 새 비밀번호로 다시 로그인해주세요.')
                await signOut({ callbackUrl: `${window.location.origin}/auth/login/teacher` })
            } else {
                setError(data?.message || '비밀번호가 일치하지 않습니다.')
            }
        }, {
            onError: (error) => {
                console.error(error);
                setError('요청 중 오류가 발생했습니다. 다시 시도해주세요.')
            },
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
        runAction("updateCurrencyName", async () => {
            const data = await updateCurrencyName({
                classId,
                currencyName: currencyData.currencyName,
                currencyEmoji: currencyData.currencyEmoji,
            });

            if (data?.result === true) {
                mutateClassData();
                toast.success('화폐 설정을 변경하였습니다')
            } else {
                toast.error(data?.message || '화폐 설정 변경에 실패했습니다.')
            }
        }, {
            onError: (error) => {
                console.error(error);
                toast.error('화폐 설정 변경에 실패했습니다.')
            },
        })
    }
    const isLoading =
    isClassLoading || isStudentsLoading || isUserLoading;

  const isError =
    isClassError || isStudentsError || isUserError;

    if (isLoading) return <div>불러오는 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    const { profileNickname, profileState, profileUrl } = userData;
    const { currencyEmoji, currencyName } = classData;

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
                        : tab === "pwd" ? (
                            <div>
                                <PwdSection {...{ onPwdChange, password, onPwdSubmit, error }} />
                                <div className="mx-[20px] mt-[40px] rounded-xl border border-red-200 p-4 max-w-[400px]">
                                    <h3 className="font-bold text-red-600">회원 탈퇴</h3>
                                    <p className="mt-1 text-sm text-gray-500">계정과 모든 학급·학생 정보가 즉시 삭제되며 복구할 수 없습니다.</p>
                                    <button type="button" onClick={() => setModalId("WITHDRAW")} className="mt-3 rounded-lg border border-red-400 px-3 py-1 text-sm text-red-500 hover:bg-red-50">
                                        회원 탈퇴
                                    </button>
                                </div>
                            </div>
                        )
                            : <ClassSection {...{ currencyEmoji, currencyName, currencyData, setCurrencyData, onCurrencyChange, onCurrencySubmit }} />}
                </div>
            </div>
            <WithdrawModal modalId={modalId} setModalId={setModalId} />
        </div>
    )
}