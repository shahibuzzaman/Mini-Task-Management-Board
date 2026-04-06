"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskStatus } from "@/features/tasks/types/task";

type BoardColumnDropZoneProps = {
  status: TaskStatus;
  children: React.ReactNode;
};

export function BoardColumnDropZone({
  status,
  children,
}: BoardColumnDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column:${status}`,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "flex flex-1 flex-col rounded-2xl transition-colors",
        isOver ? "bg-slate-100/70" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
