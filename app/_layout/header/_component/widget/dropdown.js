"use client";

import { useMemo } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

function splitNavToSections(navItems) {
  const sections = [];
  const singles = [];

  (navItems ?? []).forEach((item) => {
    if (item?.submenu?.length) {
      sections.push({
        key: `section-${item.key}`,
        title: item.label,
        icon: item.icon,
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

function resolveHref(item, id) {
  const href = item?.href;
  if (!href) return "#";
  if (typeof href === "function") return href(id); // ✅ 너 config: (id)=>string
  return href; // studentNav처럼 string일 수도 있음
}

function isItemActive(item, pathname, id) {
  const rule = item?.activeMatch ?? item?.active; // studentNav의 active도 커버
  if (!rule) return false;

  if (typeof rule === "function") {
    // ✅ teacherNav: (pathname, id) / studentNav: (pathname)
    return rule.length >= 2 ? !!rule(pathname, id) : !!rule(pathname);
  }
  if (rule instanceof RegExp) return rule.test(pathname);
  if (typeof rule === "string") return pathname === rule;
  return false;
}

function NavLink({ item, href, active, children }) {
  const baseClass = [
    "block py-[0.5rem] px-[16px] text-[1.2rem] flex items-center",
    active ? "text-orange-400 font-semibold" : "",
  ].join(" ");

  // ✅ 외부 링크 / 새탭
  if (item?.newTab) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={baseClass}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default function DropDown({
  money,
  currencyEmoji,
  currencyName,
  navItems,
  userId,
}) {
  const pathname = usePathname();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const sections = useMemo(() => splitNavToSections(navItems), [navItems]);

  return (
    <nav className="border-b-2 min-[979px]:hidden dark:text-white" aria-label="Mobile menu">
      <ul>
        {/* 상단 유저/로그아웃 */}
        <li className="mt-[1rem]">
          <div className="flex items-center justify-between">
            <div className="py-[0.5rem] px-[8px] text-[1.2rem] ml-[8px]">
              <span className="text-orange-500">{userId || "관리자"}</span>님, 환영합니다
            </div>

            <button
              type="button"
              className="rounded-[20px] py-[4px] px-[8px] text-gray-700 border-gray-300 flex bg-orange-200 border-0"
              onClick={() => signOut({ callbackUrl: "/" })}
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
              {(money ?? 0).toLocaleString("ko-KR")}
              <span className="ml-[4px]">{currencyName}</span>
            </div>
          </div>
        </li>

        {/* 섹션형 메뉴 */}
        <li className="mt-[1rem]">
          {sections.map((section, idx) => (
            <div key={section.key} className="mb-[1rem]">
              <div className="px-[16px] text-[0.95rem] text-gray-500 dark:text-gray-300 flex items-center gap-2">
                {section.title}
              </div>

              <ul className="mt-[0.25rem]">
                {section.items.map((item) => {
                  const href = resolveHref(item, id);
                  const active = isItemActive(item, pathname, id);
                  const Icon = item?.icon;

                  return (
                    <li key={item.key}>
                      <NavLink item={item} href={href} active={active}>
                        {Icon ? <Icon className="w-5 h-5 mr-2" aria-hidden="true" /> : null}
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>

              {idx !== sections.length - 1 && (
                <div className="mx-[16px] mt-[0.5rem] border-b border-gray-200 dark:border-zinc-700" />
              )}
            </div>
          ))}
        </li>
      </ul>
    </nav>
  );
}