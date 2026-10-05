"use client";

// 드래그로 순서 바꾸기 공용 컴포넌트 (dnd-kit)
// - enabled일 때만 끌 수 있다 (평소에는 카드 클릭이 그대로 동작)
// - 마우스: 5px 움직이면 잡힘 / 터치: 0.2초 길게 누르면 잡힘 (그냥 밀면 화면 스크롤) / 키보드: 스페이스 + 화살표
// - layout="grid"(여러 줄 카드) | "vertical"(세로 목록)
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

function SortableItem({ id, enabled, children, itemClassName }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !enabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...(enabled ? { ...attributes, ...listeners } : {})}
      // 편집 모드에서는 카드 클릭(수정 창 열기 등)을 막는다
      onClickCapture={enabled ? (e) => e.stopPropagation() : undefined}
      className={`
        relative ${itemClassName ?? ""}
        ${enabled ? "cursor-grab touch-none select-none active:cursor-grabbing" : ""}
        ${isDragging ? "opacity-30" : ""}
      `}
    >
      {enabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[6px] top-[6px] z-20 rounded-md bg-white/90 px-[6px] text-[1rem] leading-[1.6] text-orange-400 shadow"
        >
          ⠿
        </span>
      )}
      <div className={enabled ? "pointer-events-none rounded-lg outline-dashed outline-2 outline-offset-2 outline-orange-300" : ""}>
        {children}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   items: any[],
 *   getId: (item) => string,
 *   renderItem: (item) => React.ReactNode,
 *   onReorder: (orderedIds: string[]) => void,
 *   enabled: boolean,
 *   layout?: "grid" | "vertical",
 *   className?: string,       // 목록을 감싸는 div
 *   itemClassName?: string,   // 각 항목을 감싸는 div
 *   children?: React.ReactNode // 목록 끝에 붙는 고정 요소 (예: "+ 추가" 카드)
 * }} props
 */
export default function SortableList({
  items,
  getId,
  renderItem,
  onReorder,
  enabled,
  layout = "grid",
  className,
  itemClassName,
  children,
}) {
  const [activeId, setActiveId] = useState(null);
  const ids = items.map((it) => String(getId(it)));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };

  const activeItem = activeId ? items.find((it) => String(getId(it)) === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={layout === "vertical" ? verticalListSortingStrategy : rectSortingStrategy}>
        <div className={className}>
          {items.map((it) => (
            <SortableItem key={String(getId(it))} id={String(getId(it))} enabled={enabled} itemClassName={itemClassName}>
              {renderItem(it)}
            </SortableItem>
          ))}
          {children}
        </div>
      </SortableContext>

      {/* 끌고 있는 카드는 손가락/마우스를 따라다니는 복사본으로 보여준다 */}
      <DragOverlay>
        {activeItem ? (
          <div className={`${itemClassName ?? ""} rotate-2 scale-105 cursor-grabbing shadow-2xl`}>{renderItem(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
