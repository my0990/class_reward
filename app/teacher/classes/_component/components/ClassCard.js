"use client";
import { useRouter } from "next/navigation";

export default function ClassCard({ cls, onClick }) {
  const router = useRouter();

  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-2xl shadow
        p-6 cursor-pointer
        hover:scale-105
        transition
      "
    >
      <h2 className="text-lg font-semibold">
        {cls.className}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        학생 수: {cls.studentsCount}
      </p>
    </div>
  );
}