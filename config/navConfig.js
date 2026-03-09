// components/header/headerNav.config.js
import {
    FireIcon,          // 학급 온도계
    ComputerDesktopIcon, // 키오스크
    MegaphoneIcon,    // 공지사항
  } from "@heroicons/react/24/outline";
  
const isActive = (pathname, rule) => {
    if (!rule) return false;
    if (typeof rule === "string") return pathname === rule;
    if (rule instanceof RegExp) return rule.test(pathname);
    if (typeof rule === "function") return !!rule(pathname);
    return false;
};

export const teacherNav = [
    {
      key: "manage",
      label: "관리",
      submenu: [
        {
          key: "manage-student",
          label: "학생 관리",
          href: (id) => `/teacher/dashboard/${id}/manage`,
          activeMatch: (pathname, id) =>
            pathname === `/teacher/dashboard/${id}/manage`,
        },
        {
          key: "manage-market",
          label: "아이템 관리",
          href: (id) => `/teacher/dashboard/${id}/market`,
          activeMatch: (pathname, id) =>
            pathname === `/teacher/dashboard/${id}/market`,
        },
        {
          key: "manage-quest",
          label: "퀘스트 관리",
          href: (id) => `/teacher/dashboard/${id}/quest`,
          activeMatch: (pathname, id) =>
            pathname.startsWith(`/teacher/dashboard/${id}/quest`),
        },
        // {
        //   key: "manage-profile",
        //   label: "프로필 관리",
        //   href: (id) => `/teacher/dashboard/${id}/profile`,
        //   activeMatch: (pathname, id) =>
        //     pathname === `/teacher/dashboard/${id}/profile`,
        // },
      ],
    },
  
    // {
    //   key: "thermometer",
    //   label: "학급 온도계",
    //   href: (id) => `/teacher/dashboard/${id}/thermometer`,
    //   icon: FireIcon,
    //   activeMatch: (pathname, id) =>
    //     pathname === `/teacher/dashboard/${id}/thermometer`,
    // },
  
    {
      key: "kiosk",
      label: "키오스크",
      href: (id) => `/teacher/kiosk/${id}`,
      icon: ComputerDesktopIcon,
      activeMatch: () => false,
    },
  
    {
      key: "notices",
      label: "공지사항",
      href: (id) => `/teacher/dashboard/${id}/notices`,
      icon: MegaphoneIcon,
      activeMatch: (pathname, id) =>
        pathname === `/teacher/dashboard/${id}/notices`,
    },
  
    {
      key: "tool",
      label: "도구",
      submenu: [
        {
          key: "tool-student",
          label: "번호 뽑기",
          href: (id) => `/teacher/dashboard/${id}/tools/random`,
          activeMatch: (pathname, id) => pathname === `/teacher/dashboard/${id}/tools/random`,
        },
        // {
        //   key: "tool-market",
        //   label: "자리 바꾸기",
        //   href: (id) => `/teacher/dashboard/${id}/tools/seat`,
        //   activeMatch: (pathname, id) => pathname === `/teacher/dashboard/${id}/tools/seat`,
        // },
        {
          key: "tool-quest",
          label: "타이머",
          href: () => `https://my0990.github.io/decibel_meter/`,
          newTab: true,                // ✅ 추가
          activeMatch: () => false,    // 외부 링크라 active 없음
        },
      ],
    },
  ];

export const studentNav = [
    { key: "inventory", label: "창고 가기", href: "/directory/inventory", active: "/directory/inventory" },
    { key: "market", label: "상점 가기", href: "/directory/market", active: "/directory/market" },
    { key: "thermometer", label: "학급온도계", href: "/directory/thermometer", active: "/directory/thermometer" },
    { key: "profile", label: "프로필 상점", href: "/directory/profile", active: "/directory/profile" },
    { key: "quest", label: "퀘스트", href: "/directory/quest", active: (p) => /^\/directory\/quest/.test(p) || /^\/directory\/questDetail/.test(p) },
];

export const resolveNav = (role, pathname) => {
    const items = role === "teacher" ? teacherNav : studentNav;
    return items.map((it) => ({
        ...it,
        isActive: isActive(pathname, it.active),
    }));
};

export const toolsMenu = [
    {
        key: "cannon",
        label: "대포 번호 뽑기",
        href: () => "https://my0990.github.io/random_number/",
    },
    {
        key: "random",
        label: "랜덤 번호 뽑기",
        href: ({ baseUrl }) => `${baseUrl}tools/random`,
    },
    {
        key: "timer",
        label: "타이머",
        href: () => "https://my0990.github.io/decibel_meter/",
    },
    {
        key: "seat_old",
        label: "자리 바꾸기",
        href: () => "https://my0990.github.io/switching_seats/",
    },
    {
        key: "seat_new",
        label: "자리 바꾸기(new)",
        href: ({ baseUrl }) => `${baseUrl}tools/seat`,
    },
];