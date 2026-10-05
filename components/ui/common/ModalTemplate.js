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
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={onOutsideClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-2xl min-w-[320px] ${hasMaxWidth ? "" : "max-w-[95vw]"} shadow-xl ${className}`}
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