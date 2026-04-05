"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "@/components/board/sortable-task-card";
import {
  TASK_CARD_ESTIMATED_HEIGHT,
  TASK_COLUMN_OVERSCAN,
} from "@/features/tasks/lib/task-virtualization";
import type { Task } from "@/features/tasks/types/task";

type VirtualizedTaskColumnListProps = {
  tasks: Task[];
};

export function VirtualizedTaskColumnList({
  tasks,
}: VirtualizedTaskColumnListProps) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  // TanStack Virtual manages imperative measurement internally. React Compiler
  // cannot safely memoize this hook, so we opt out at this callsite.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => TASK_CARD_ESTIMATED_HEIGHT,
    overscan: TASK_COLUMN_OVERSCAN,
  });

  return (
    <div
      ref={scrollElementRef}
      className="max-h-[36rem] overflow-y-auto pr-1"
      aria-label="Virtualized task list"
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const task = tasks[virtualRow.index];

            if (!task) {
              return null;
            }

            return (
              <div
                key={task.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute left-0 top-0 w-full pb-3"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <SortableTaskCard task={task} />
              </div>
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}
