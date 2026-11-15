'use client';
import { profileImgProps } from "@/util/image/profileImage";
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
                {...profileImgProps(formData.profileUrl, 96)}
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
          maxLength={20}
          onChange={onChange}
        />

        <h2 className="mt-[24px]">프로필 상태 메시지</h2>
        <textarea
          className="w-full border-2 focus:outline-orange-500"
          name="profileState"
          value={formData.profileState}
          maxLength={200}
          onChange={onChange}
        />
        {/* 너무 긴 글은 저장도 안 되고 서버가 요청 자체를 거절한다 (1MB 넘으면 오류 화면) → 입력에서 막기 */}
        <p className="text-right text-xs text-gray-400">{(formData.profileState ?? "").length}/200</p>

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