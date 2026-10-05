"use client";

export default function ClassCard({ cls, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="
        relative bg-white rounded-2xl shadow
        p-6 cursor-pointer
        hover:scale-105
        transition
      "
    >
      {onDelete && (
        <button
          type="button"
          aria-label={`${cls.className} 삭제`}
          title="학급 삭제"
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭(학급 들어가기)과 분리
            onDelete(cls);
          }}
          className="
            absolute right-3 top-3 rounded-full p-[6px]
            text-gray-400 hover:bg-red-50 hover:text-red-500
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}

      <h2 className="text-lg font-semibold pr-8">
        {cls.className}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        학생 수: {cls.studentsCount}
      </p>
    </div>
  );
}
