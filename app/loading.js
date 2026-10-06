// 화면을 불러오는 동안
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="불러오는 중">
      <span className="loading loading-dots loading-lg text-orange-400" />
    </div>
  );
}
