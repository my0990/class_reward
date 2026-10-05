'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function HeaderNav({ navItems, pathname, classId }) {
  const [openKey, setOpenKey] = useState(null);
  const closeTimer = useRef(null);
  const navRef = useRef(null);
  const lastPointerType = useRef("mouse");

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const openMenu = (key) => {
    clearCloseTimer();
    setOpenKey(key);
  };

  const closeMenu = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpenKey(null);
    }, 200);
  };

  const closeNow = () => {
    clearCloseTimer();
    setOpenKey(null);
  };

  // 헤더는 페이지를 옮겨도 그대로 남아 있으므로, 주소가 바뀌면 열린 하위 메뉴를 닫는다.
  useEffect(() => {
    closeNow();
  }, [pathname]);

  // 메뉴 바깥을 클릭·터치하거나 ESC를 누르면 닫는다 (터치 화면에는 "마우스가 나감"이 없다).
  useEffect(() => {
    if (!openKey) return;
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeNow();
    };
    const onKey = (e) => e.key === "Escape" && closeNow();
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  useEffect(() => clearCloseTimer, []);

  // 마우스는 올리면 열리고 벗어나면 닫힌다. 터치는 hover가 없으므로 상위 메뉴를 눌러서 열고 닫는다.
  const onItemPointerEnter = (e, key) => e.pointerType === "mouse" && openMenu(key);
  const onItemPointerLeave = (e) => e.pointerType === "mouse" && closeMenu();
  const onParentClick = (key) => {
    if (lastPointerType.current === "mouse") return; // 마우스는 이미 hover로 열려 있다
    setOpenKey((k) => (k === key ? null : key));
  };

  // ✅ newTab 지원 링크 렌더러
  const NavLink = ({ href, newTab, children, className, onClick }) => {
    if (newTab) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} prefetch={false} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  };

  return (
    <ul
      ref={navRef}
      className="flex max-[980px]:hidden relative "
      onPointerDown={(e) => { lastPointerType.current = e.pointerType; }}
    >
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
            onPointerEnter={(e) => hasSubmenu && onItemPointerEnter(e, item.key)}
            onPointerLeave={(e) => hasSubmenu && onItemPointerLeave(e)}
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
                  ${isActive ? "border-b-8 border-orange-400" : "border-b-8 border-white"}
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="ml-[4px]">{item.label}</span>
              </NavLink>
            ) : (
              <div
                role={hasSubmenu ? "button" : undefined}
                aria-expanded={hasSubmenu ? isOpen : undefined}
                onClick={() => hasSubmenu && onParentClick(item.key)}
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
                  absolute top-[62.5px] z-50
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
                onPointerEnter={(e) => onItemPointerEnter(e, item.key)}
                onPointerLeave={onItemPointerLeave}
              >
                {item.submenu.map((sub) => {
                  const subActive = sub.activeMatch?.(pathname, classId);
                  const subHref = sub.href(classId);

                  return (
                    <li key={sub.key}>
                      <NavLink
                        href={subHref}
                        newTab={sub.newTab}
                        onClick={closeNow}
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