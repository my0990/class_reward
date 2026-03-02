'use client';

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalTemplate({
  id,
  modalId,
  setModalId,
  children,
  onClose
}) {

  const isOpen = modalId === id;
  const modalRef = useRef(null);

  const close = () => {
    onClose?.();    // ✅ 여기서 cleanup 실행
    setModalId(null);
  };

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
            className="bg-white rounded-2xl  min-w-[320px] shadow-xl"
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