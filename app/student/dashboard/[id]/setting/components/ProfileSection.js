'use client';
import { useEffect } from "react";

export default function ProfileSection({ profileNickname, profileState, profileUrl, setFormData, onSubmit, formData, onChange, isPending }) {
  useEffect(() => {
    setFormData({
      profileNickname: profileNickname ?? "",
      profileState: profileState ?? "",
      profileUrl: profileUrl ?? "",
    });
  }, [
    profileNickname,
    profileState,
    profileUrl,
  ]);
  return (
    <div className="flex justify-center p-[20px] min-[600px]:p-[40px] max-[601px]:w-full">
      <form onSubmit={onSubmit} className="w-[280px] text-[1.1rem]">
        <h1 className="mb-[24px] text-[2rem]">프로필</h1>

        <div className="avatar w-full justify-center">
          <div className="w-24 rounded-full border-[6px] border-orange-200 ring-offset-2 ring-offset-base-100 transition-all">
            {formData.profileUrl ? (
              <img
                src={formData.profileUrl}
                width="100"
                height="100"
                alt="profile"
              />
            ) : (
              <div className="h-[96px] w-[96px] rounded-full bg-gray-100" />
            )}
          </div>
        </div>

        <h2 className="mt-[24px]">프로필 별명</h2>
        <input
          className="w-full border-2 focus:outline-orange-500"
          name="profileNickname"
          value={formData.profileNickname}
          onChange={onChange}
        />

        <h2 className="mt-[24px]">프로필 상태 메시지</h2>
        <textarea
          className="w-full border-2 focus:outline-orange-500"
          name="profileState"
          value={formData.profileState}
          onChange={onChange}
        />

        <button
          type="submit"
          disabled={isPending("editProfile")}
          className="btn mt-[24px] block w-full border-0 bg-orange-500 text-white disabled:opacity-60"
        >
          {isPending("editProfile") ? "수정 중..." : "확인"}
        </button>
      </form>
    </div>
  );
}