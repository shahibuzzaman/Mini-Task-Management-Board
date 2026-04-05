"use client";

import { memo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { TaskCard } from "@/components/board/task-card";
import type { Task } from "@/features/tasks/types/task";

type SortableTaskCardProps = {
  task: Task;
};

function SortableTaskCardComponent({ task }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        taskId: task.id,
        status: task.status,
      },
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-40" : ""}
    >
      <TaskCard
        task={task}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
}

export const SortableTaskCard = memo(SortableTaskCardComponent);
