"use client";

import { useMemo } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function splitNavToSections(navItems) {
  const sections = [];
  const singles = [];

  (navItems ?? []).forEach((item) => {
    if (item?.submenu?.length) {
      sections.push({
        key: `section-${item.key}`,
        title: item.label,
        items: item.submenu,
      });
    } else {
      singles.push(item);
    }
  });

  if (singles.length) {
    sections.push({
      key: "section-others",
      title: "기타",
      items: singles,
    });
  }

  return sections;
}

function isItemActive(item, pathname) {
  if (typeof item?.activeMatch === "function") return !!item.activeMatch(pathname);
  if (item?.href) return pathname === item.href;
  return false;
}

export default function DropDown({ money, currencyEmoji, currencyName, navItems, userId }) {
  const pathname = usePathname();



  const sections = useMemo(() => splitNavToSections(navItems), [navItems]);

  return (
    <nav className="border-b-2 min-[979px]:hidden dark:text-white" aria-label="Mobile menu">
      <ul>
        {/* 상단 유저/로그아웃 */}
        <li className="mt-[1rem]">
          <div className="flex items-center justify-between">
            <div className="py-[0.5rem] px-[8px] text-[1.2rem] ml-[8px]">
              <span className="text-orange-500">{userId}</span>님, 환영합니다
            </div>

            <button
              type="button"
              className="rounded-[20px] py-[4px] px-[8px] text-gray-700 border-gray-300 flex bg-orange-200 border-0"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="로그아웃"
            >
              로그아웃
              <svg
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-[4px] text-gray-500"
                aria-hidden="true"
              >
                <path
                  d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
                  stroke="#374151"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </li>

        {/* 포인트 */}
        <li className="py-[0.5rem] px-[16px] text-[1.2rem]">
          <div className="flex items-center">
            <div className="mr-3">{currencyEmoji}</div>
            <div>
              {money.toLocaleString("ko-KR")} 
              <span className="ml-[4px]">{currencyName}</span>
            </div>
          </div>
        </li>

        {/* 설정 */}
        <li>
          <Link
            href="/directory/setting"
            className="py-[0.5rem] px-[16px] pb-[1rem] text-[1.2rem] border-b-2 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" aria-hidden="true">
              <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z" />
            </svg>
            <span className="ml-[8px]">설정</span>
          </Link>
        </li>

        {/* 섹션형 메뉴 */}
        <li className="mt-[1rem]">
          {sections.map((section, idx) => (
            <div key={section.key} className="mb-[1rem]">
              <div className="px-[16px] text-[0.95rem] text-gray-500 dark:text-gray-300">
                {section.title}
              </div>

              <ul className="mt-[0.25rem]">
                {section.items.map((item) => {
                  const active = isItemActive(item, pathname);
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className={[
                          "block py-[0.5rem] px-[16px] text-[1.2rem]",
                          active ? "text-orange-400 font-semibold" : "",
                        ].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* 마지막 섹션은 구분선 생략하고 싶으면 idx 체크 */}
              <div className="mx-[16px] mt-[0.5rem] border-b border-gray-200 dark:border-zinc-700" />
            </div>
          ))}
        </li>
      </ul>
    </nav>
  );
}