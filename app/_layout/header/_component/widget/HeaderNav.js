'use client';

import { useState, useRef } from "react";
import Link from "next/link";

export default function HeaderNav({ navItems, pathname, classId }) {
  const [openKey, setOpenKey] = useState(null);
  const closeTimer = useRef(null);

  const openMenu = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => {
      setOpenKey(null);
    }, 200);
  };

  // ✅ newTab 지원 링크 렌더러
  const NavLink = ({ href, newTab, children, className }) => {
    if (newTab) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} prefetch={false} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <ul className="flex max-[980px]:hidden relative z-50">
      {navItems.map((item) => {
        const hasSubmenu = !!item.submenu?.length;
        const isOpen = openKey === item.key;

        // ✅ new config: activeMatch(pathname, classId)
        const isActive =
          item.activeMatch?.(pathname, classId) ||
          item.submenu?.some((sub) => sub.activeMatch?.(pathname, classId));

        const highlight = isOpen || isActive;
        const Icon = item.icon;

        const itemHref = item.href ? item.href(classId) : null;

        return (
          <li
            key={item.key}
            className="relative mr-[3vw]"
            onMouseEnter={() => hasSubmenu && openMenu(item.key)}
            onMouseLeave={() => hasSubmenu && closeMenu()}
          >
            {/* 상위 메뉴 */}
            {itemHref ? (
              <NavLink
                href={itemHref}
                newTab={item.newTab}
                className={`
                  flex items-center gap-1 cursor-pointer
                  transition-colors duration-200 hover:text-orange-500
                  ${highlight ? "text-orange-500" : "dark:text-white"}
                  ${isActive ? "border-b-8 border-orange-400" : ""}
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="ml-[4px]">{item.label}</span>
              </NavLink>
            ) : (
              <div
                className={`
                  flex items-center gap-1 cursor-pointer
                  transition-colors duration-200
                  ${highlight ? "text-orange-500" : "dark:text-white"}
                  ${isActive ? "border-b-8 border-orange-400" : ""}
                `}
              >
                {item.label}

                {hasSubmenu && (
                  <span
                    className={`
                      text-xs
                      transition-transform duration-200
                      ${isOpen ? "rotate-180" : "rotate-0"}
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </span>
                )}
              </div>
            )}

            {/* Submenu */}
            {hasSubmenu && (
              <ul
                className={`
                  absolute top-[58.5px]
                  min-w-[180px]
                  dark:bg-zinc-800
                  border rounded-b-md bg-white
                  overflow-hidden
                  transition-all duration-200 ease-out
                  left-1/2 -translate-x-1/2
                  border border-t-0 border-gray-200 border-2
                  ${isOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"}
                `}
                onMouseEnter={() => openMenu(item.key)}
                onMouseLeave={closeMenu}
              >
                {item.submenu.map((sub) => {
                  const subActive = sub.activeMatch?.(pathname, classId);
                  const subHref = sub.href(classId);

                  return (
                    <li key={sub.key}>
                      <NavLink
                        href={subHref}
                        newTab={sub.newTab}
                        className={`
                          block px-4 py-2 whitespace-nowrap
                          transition-colors
                          hover:bg-orange-100 dark:hover:bg-zinc-700 text-center
                          ${subActive
                            ? "bg-orange-50 dark:bg-zinc-700 font-semibold"
                            : ""}
                        `}
                      >
                        {sub.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}