import Link from "next/link"
export default function HomeBtn({homeHref, className}) {
    return (
        <div>
            <Link prefetch={false} href={homeHref} replace>
                <div
                    className="
                            w-[110px] h-[56px]
                            font-medium text-[24px] font-extrabold text-orange-500
                            hover:scale-110 transition-all duration-500
                            align-middle flex justify-start items-center
                            overflow-hidden whitespace-nowrap text-ellipsis

                        "
                >
                    {className}
                </div>
            </Link>
        </div>
    )
}