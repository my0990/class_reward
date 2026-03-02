"use client";
import { useRouter } from "next/navigation";

export default function AddClassCard({onClick}) {
  const router = useRouter();

  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-2xl shadow
        p-6 cursor-pointer
        hover:scale-105
        transition
        flex
        justify-center
        items-center
        text-[2rem]
      "
    >
        +
    </div>
  )
}