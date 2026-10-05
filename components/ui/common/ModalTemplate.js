'use client';

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalTemplate({
  id,
  modalId,
  setModalId,
  children,
  onClose,
  className=""
}) {

  const isOpen = modalId === id;

  // className에 max-w-를 넘기면 기본값(max-w-[95vw])을 빼야 한다.
  // 둘 다 붙이면 CSS 파일에서 뒤에 오는 max-w-[95vw]가 이겨서, 넘긴 max-w가 무시된다.
  // (예: 퀘스트 등록 모달이 max-w-[600px] 대신 화면 너비로 늘어나 오른쪽이 비어 보였음)
  const hasMaxWidth = /(^|\s)max-w-/.test(className);
  const modalRef = useRef(null);

  const close = useCallback(() => {
    onClose?.();
    setModalId(null);
  }, [onClose]);

  // ESC 닫기
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") close();
    };

    if (isOpen) {
      window.addEventListener("keydown", esc);
    }

    return () => {
      window.removeEventListener("keydown", esc);
    };
  }, [isOpen]);

  // 외부 클릭 닫기
  const onOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // 창이 화면보다 길면 바깥(배경)이 스크롤된다. items-center로 가운데 정렬하면
          // 화면보다 긴 창은 위아래가 잘려서 스크롤로도 볼 수 없으므로, m-auto로 가운데 정렬한다.
          className="fixed inset-0 z-50 flex overflow-y-auto overscroll-contain bg-black/40 p-[12px]"
          onClick={onOutsideClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`m-auto bg-white rounded-2xl min-w-[min(320px,100%)] ${hasMaxWidth ? "" : "max-w-[95vw]"} shadow-xl ${className}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            {children({ close })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}