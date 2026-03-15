'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
export default function Notices() {
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 5;

  const {
    data: noticesData,
    isLoading: isNoticesDataLoading,
    isError: isNoticesDataError,
  } = useFetchData(`/api/notices?page=${page}&limit=${limit}`);

  const NOW = Date.now();
  const NEW_LIMIT = 1000 * 60 * 60 * 48; // 48시간

  if (isNoticesDataLoading) return <div>Loading data...</div>;
  if (isNoticesDataError) return <div>Error loading data</div>;

  // API가 { success, notices, total, page, limit } 형식일 때
  const notices = noticesData?.notices ?? [];
  const total = noticesData?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto p-6 ">
        {/* <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold ">공지사항</h1>
          <Link href="/announcements/write">
            <div className="bg-black text-white px-4 cursor-pointer py-2 rounded-full">
              글쓰기
            </div>
          </Link>
        </div> */}

        {/* 공지 리스트 */}
        <div className="space-y-4">
          {notices.map((n) => {
            const d = new Date(n.createdAt);
            const u = new Date(n.updatedAt);
            const isNew = NOW - d.getTime() < NEW_LIMIT;

            return (
              <Link href={`notices/${n._id}`} key={String(n._id)}>
                <div className="bg-orange-100 p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer my-4">
                  <div className="flex">
                    <h2 className="font-semibold text-lg">{n.title}</h2>
                    {isNew && (
                      <div className="badge badge-secondary bg-red-500 ml-2">
                        new
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-400 mt-3 flex">
                    <div>
                      {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일
                    </div>
                    <div>
                      {n.updatedAt && n.updatedAt !== n.createdAt && (
                        <span className="ml-2">
                          &#40;
                          <span className="text-green-600 mr-1">수정됨:</span>
                          {u.getFullYear()}년 {u.getMonth() + 1}월 {u.getDate()}일
                          &#41;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 페이지네이션 (스타일 최대한 심플하게 유지) */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href={`/announcements?page=${page - 1}`}
            className={`px-4 py-2 rounded-full border ${
              hasPrev ? "cursor-pointer hover:bg-gray-100" : "pointer-events-none opacity-40"
            }`}
          >
            이전
          </Link>

          <div className="text-sm text-gray-500">
            {page} / {totalPages}
          </div>

          <Link
            href={`/announcements?page=${page + 1}`}
            className={`px-4 py-2 rounded-full border ${
              hasNext ? "cursor-pointer hover:bg-gray-100" : "pointer-events-none opacity-40"
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </div>
  );
}