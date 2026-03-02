"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchData } from "@/hooks/swrHooks";

export default function NoticeDetail() {
  const { id, noticeId } = useParams();

  const { data, isLoading, isError } = fetchData(`/api/notices/${noticeId}`);

  if (isLoading) return <div>Loading data...</div>;
  if (isError || !data?.success) return <div>Error loading data</div>;

  const notice = data.notice;

  const d = new Date(notice.createdAt);
  const u = new Date(notice.updatedAt);
  const NOW = Date.now();
  const NEW_LIMIT = 1000 * 60 * 60 * 48;
  const isNew = NOW - d.getTime() < NEW_LIMIT;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-white rounded-xl">
      {/* (UI 동일) */}
      <div className="border-b pb-4 mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">{notice.title}</h1>
          {isNew && <div className="badge badge-secondary bg-red-500 ml-2">new</div>}
        </div>
        <div className="text-sm text-gray-400 mt-3 flex">
          <div>
            {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일
          </div>
          <div>
            {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
              <span className="ml-2">
                &#40;<span className="text-green-600 mr-1">수정됨:</span>
                {u.getFullYear()}년 {u.getMonth() + 1}월 {u.getDate()}일&#41;
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
        {notice.content}
      </div>

      <div className="mt-10 flex justify-between text-sm">
        <Link href={`/teacher/dashboard/${id}/notices`} className="px-4 py-2 rounded-md border hover:bg-gray-50 flex items-center">
          목록으로
        </Link>

      </div>
    </div>
  );
}