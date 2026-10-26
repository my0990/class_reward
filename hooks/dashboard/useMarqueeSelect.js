"use client";
// 네모로 묶어 고르기: 카드가 없는 빈 곳에서 끌기 시작하면 네모가 그려지고, 걸친 카드가 선택에 더해진다.
// - 마우스: 5px 넘게 움직이면 시작
// - 터치·펜: 0.3초 길게 누른 뒤 끌어야 시작 (그냥 끌면 지금처럼 화면 스크롤)
// - 카드·버튼 위에서 시작하면 동작하지 않음 (카드 클릭은 그대로)
// - 화면 위·아래 끝에 가까워지면 자동으로 스크롤
import { useEffect, useRef, useState } from "react";

const MOUSE_START_PX = 5;
const TOUCH_HOLD_MS = 300;
const TOUCH_SLOP_PX = 10;
const EDGE_PX = 48;
const SCROLL_STEP = 16;
const NO_START = "button,a,input,textarea,select,label,[role=dialog],[data-no-marquee]";

/**
 * @param {{ itemSelector?: string, getBase: () => Set<string>, onChange: (ids: string[]) => void }} opts
 *   카드 요소에 data-select-id="아이디"를 붙인다
 */
export default function useMarqueeSelect({ itemSelector = "[data-select-id]", getBase, onChange }) {
  const [box, setBox] = useState(null); // 화면에 그릴 네모 (client 좌표)
  const drag = useRef(null);
  const cb = useRef({ getBase, onChange });
  cb.current = { getBase, onChange };

  useEffect(() => () => drag.current?.cleanup?.(), []);

  const onPointerDown = (e) => {
    if (e.button !== 0 || drag.current) return;
    if (e.target.closest(itemSelector) || e.target.closest(NO_START)) return;
    const root = e.currentTarget;
    const isMouse = e.pointerType === "mouse";
    const d = {
      root,
      active: false,
      startX: e.clientX + window.scrollX, // 페이지 좌표 (스크롤해도 시작점 유지)
      startY: e.clientY + window.scrollY,
      lastX: e.clientX,
      lastY: e.clientY,
      base: new Set(cb.current.getBase()),
      timer: null,
    };
    drag.current = d;

    const update = () => {
      const curX = d.lastX + window.scrollX;
      const curY = d.lastY + window.scrollY;
      const left = Math.min(d.startX, curX);
      const top = Math.min(d.startY, curY);
      const right = Math.max(d.startX, curX);
      const bottom = Math.max(d.startY, curY);
      setBox({ left: left - window.scrollX, top: top - window.scrollY, width: right - left, height: bottom - top });
      const hits = new Set(d.base);
      d.root.querySelectorAll(itemSelector).forEach((el) => {
        const r = el.getBoundingClientRect();
        const l = r.left + window.scrollX;
        const t = r.top + window.scrollY;
        if (l < right && l + r.width > left && t < bottom && t + r.height > top) hits.add(el.getAttribute("data-select-id"));
      });
      cb.current.onChange([...hits]);
    };

    const activate = () => {
      d.active = true;
      document.body.style.userSelect = "none";
      update();
    };

    const onMove = (ev) => {
      d.lastX = ev.clientX;
      d.lastY = ev.clientY;
      const dx = Math.abs(ev.clientX + window.scrollX - d.startX);
      const dy = Math.abs(ev.clientY + window.scrollY - d.startY);
      if (!d.active) {
        if (isMouse && Math.max(dx, dy) > MOUSE_START_PX) activate();
        else if (!isMouse && Math.max(dx, dy) > TOUCH_SLOP_PX) cleanup(); // 길게 누르기 전에 움직이면 스크롤로 양보
        return;
      }
      if (ev.clientY < EDGE_PX) window.scrollBy(0, -SCROLL_STEP);
      else if (ev.clientY > window.innerHeight - EDGE_PX) window.scrollBy(0, SCROLL_STEP);
      update();
    };
    // 네모를 그리는 동안에는 터치 스크롤을 막는다
    const onTouchMove = (ev) => {
      if (d.active) ev.preventDefault();
    };
    const cleanup = () => {
      clearTimeout(d.timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
      window.removeEventListener("touchmove", onTouchMove);
      if (d.active) document.body.style.userSelect = "";
      drag.current = null;
      setBox(null);
    };
    d.cleanup = cleanup;

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", cleanup);
    window.addEventListener("pointercancel", cleanup);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    if (!isMouse) d.timer = setTimeout(activate, TOUCH_HOLD_MS);
  };

  const boxElement = box ? (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 rounded-md border-2 border-orange-500 bg-orange-400/20"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    />
  ) : null;

  return { rootProps: { onPointerDown }, boxElement, dragging: Boolean(box) };
}
