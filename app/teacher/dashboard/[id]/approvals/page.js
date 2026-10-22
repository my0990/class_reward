import ApprovalsContainer from "./Approvals.container";

export default function Page() {
  return (
    <div className="flex justify-center p-[12px] sm:p-[32px]">
      <div className="w-full max-w-[1000px] min-w-0 rounded-xl bg-orange-100 p-[16px] sm:p-[32px]">
        <h1 className="mb-[8px] text-[1.6rem] font-bold sm:text-[2.5rem]">승인 센터✅</h1>
        <ApprovalsContainer />
      </div>
    </div>
  );
}
